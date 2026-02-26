import { Request, Response } from 'express';
import prisma from '../utils/prisma';

/**
 * Status Controller
 *
 * Renders a highly-aesthetic, stats.fm-style status page.
 */
export async function getStatusPage(req: Request, res: Response) {
  let dbStatus = 'Operational';
  let headerText = 'All services are online';
  
  // Use frontend logo, assuming it's hosted identically to the API logic or accessible via FRONTEND_URL
  const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
  const headerIcon = `<img src="${FRONTEND_URL}/favicon.png" alt="GeoFlags Logo" style="width: 48px; height: 48px; border-radius: 8px;">`;

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (error) {
    dbStatus = 'Degraded';
    headerText = 'Some systems are experiencing issues';
  }

  // Fetch parameters to determine if we are in Drilldown mode
  const dateQuery = req.query.date as string | undefined;

  let htmlBodyContent = '';
  
  if (dateQuery) {
    // ---- 1-DAY DRILLDOWN VIEW ----
    const targetDate = new Date(dateQuery);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const hourlyData = await prisma.uptimePing.findMany({
      where: {
        timestamp: {
          gte: targetDate,
          lt: nextDate
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Create 24 hourly blocks (we'll just show what we have)
    let hourlyGrid = '';
    let avgMs = 0;
    
    if (hourlyData.length > 0) {
       const totalMs = hourlyData.reduce((acc: number, curr: any) => acc + curr.responseTime, 0);
       avgMs = Math.round(totalMs / hourlyData.length);
       
       hourlyGrid += `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1rem; margin-top: 1rem;">`;
       hourlyData.forEach((ping: any) => {
          const timeStr = ping.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          const statusColor = ping.isUp ? 'var(--accent-green-bar)' : 'var(--accent-red)';
          hourlyGrid += `
            <div style="background: rgba(255,255,255,0.05); border: 1px solid var(--border); border-radius: 8px; padding: 1rem; text-align: center;">
              <div style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem;">${timeStr}</div>
              <div style="font-weight: bold; color: ${statusColor}; font-size: 1.2rem;">${ping.responseTime} ms</div>
            </div>
          `;
       });
       hourlyGrid += `</div>`;
    } else {
       hourlyGrid = `<p style="color: var(--text-muted); text-align: center; padding: 2rem;">No heartbeat data recorded for this date.</p>`;
    }

    htmlBodyContent = `
        <!-- Drilldown Panel -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">${targetDate.toDateString()}</div>
            <a href="/" style="color: var(--accent-primary); text-decoration: none; font-size: 0.9rem;">&larr; Back to 90 Days</a>
          </div>
          
          <div class="service">
            <div class="service-header" style="margin-bottom: 2rem;">
              <div class="service-name">Average Response Time</div>
              <div class="service-uptime-text">${avgMs} ms</div>
            </div>
            
            ${hourlyGrid}
          </div>
        </div>
    `;

  } else {
    // ---- 90-DAY AGGREGATE VIEW ----
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const uptimeData = await prisma.uptimePing.findMany({
      where: {
        timestamp: {
          gte: ninetyDaysAgo
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    // Group by Day String
    const uptimeMap = new Map<string, { totalPings: number; upPings: number }>();
    uptimeData.forEach((r: any) => {
       const dStr = r.timestamp.toDateString();
       if (!uptimeMap.has(dStr)) uptimeMap.set(dStr, { totalPings: 0, upPings: 0 });
       const entry = uptimeMap.get(dStr)!;
       entry.totalPings++;
       if (r.isUp) entry.upPings++;
    });

    // Generate 90 bars of real uptime data
    const generateBars = () => {
      let bars = '';
      let totalUptimePercentage = 0;
      
      for (let i = 0; i < 90; i++) {
          const date = new Date(Date.now() - (89 - i) * 86400000);
          const dateStr = date.toDateString();
          // We will use the explicit YYYY-MM-DD for the url query
          const isoDate = date.toISOString().split('T')[0];
          
          const stats = uptimeMap.get(dateStr);
          
          let percent = 0;
          let barClass = 'bar-nodata';
          
          if (stats && stats.totalPings > 0) {
             percent = (stats.upPings / stats.totalPings) * 100;
             if (percent === 100) barClass = 'bar-good';
             else barClass = 'bar-bad';
             
             totalUptimePercentage += percent;
          } else {
             // For missing days entirely (if the system was down 24 hours, or before system existed)
             percent = 0;
          }

          const title = `${dateStr} - ${!stats ? 'No Data' : percent.toFixed(2) + '% Uptime'}`;
          // Make the bar a clickable anchor link to the drilldown view
          bars += `<a href="/?date=${isoDate}" class="bar ${barClass}" title="${title}"></a>`;
      }
      
      // Calculate Average (only across days that had > 0 pings to avoid diluting 90 days if system is 1 day old)
      const daysWithData = Array.from(uptimeMap.values()).filter(s => s.totalPings > 0).length;
      let avg = 100;
      if (daysWithData > 0) {
         avg = totalUptimePercentage / daysWithData;
      }
      
      return { bars, avg: avg.toFixed(2) };
    };

    const dbBars = generateBars();
    const apiBars = dbBars; 
    const wsBars = dbBars;

    htmlBodyContent = `
        <!-- Main Panel -->
        <div class="panel">
          <div class="panel-header">
            <div class="panel-title">GeoFlags Servers</div>
            <div class="status-badge ${dbStatus === 'Operational' ? 'good' : 'bad'}">${dbStatus === 'Operational' ? 'Operational' : 'Degraded Issues'}</div>
          </div>

          <!-- Service: API -->
          <div class="service">
            <div class="service-header">
              <div class="service-name">Production API (Express)</div>
              <div class="service-uptime-text">${apiBars.avg}% uptime</div>
            </div>
            <div class="uptime-chart">
              ${apiBars.bars}
            </div>
            <div class="chart-labels">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>

          <!-- Service: WebSockets -->
          <div class="service">
            <div class="service-header">
              <div class="service-name">WebSocket Server</div>
              <div class="service-uptime-text">${wsBars.avg}% uptime</div>
            </div>
            <div class="uptime-chart">
               ${wsBars.bars}
            </div>
            <div class="chart-labels">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
          
          <!-- Service: Database -->
          <div class="service">
            <div class="service-header">
              <div class="service-name">Database Engine</div>
              <div class="service-uptime-text">${dbBars.avg}% uptime</div>
            </div>
            <div class="uptime-chart">
               ${dbBars.bars}
            </div>
            <div class="chart-labels">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        </div>
    `;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>GeoFlags API - Status</title>
      <style>
        :root {
          --bg-main: #13171f;
          --bg-panel: #1b202c;
          --text-main: #f8fafc;
          --text-muted: #94a3b8;
          --accent-primary: #0ea5e9; /* Sky blue Brand Color */
          --accent-green-bar: #22c55e;
          --accent-red: #ef4444;
          --accent-warn: #f59e0b;
          --accent-nodata: #334155;
          --border: #2e3646;
        }
        body {
          margin: 0;
          padding: 0;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background-color: var(--bg-main);
          color: var(--text-main);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        /* Top Navigation */
        nav {
          width: 100%;
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          border-bottom: 1px solid var(--border);
          box-sizing: border-box;
        }
        .nav-brand {
          font-size: 1.25rem;
          font-weight: bold;
          color: var(--accent-primary);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        /* Hero Section */
        .hero {
          margin-top: 4rem;
          margin-bottom: 3rem;
          text-align: center;
        }
        .hero-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          background-color: rgba(14, 165, 233, 0.1); /* Primary Blue */
          margin-bottom: 1rem;
        }
        .hero-icon.error {
          background-color: rgba(239, 68, 68, 0.1);
        }
        .hero h1 {
          font-size: 2.5rem;
          margin: 0 0 0.5rem 0;
        }
        .hero p {
          color: var(--text-muted);
          margin: 0;
        }
        
        /* Main Content Container */
        .container {
          width: 100%;
          max-width: 900px;
          padding: 0 1rem;
          box-sizing: border-box;
        }

        /* Server Group Panels */
        .panel {
          background-color: var(--bg-panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
        }
        .panel-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .panel-title {
          font-size: 1.1rem;
          font-weight: 600;
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .status-badge.good::before {
          content: "";
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent-green-bar);
        }
        .status-badge.bad::before {
          content: "";
          display: block;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: var(--accent-red);
        }

        /* Individual Services */
        .service {
          margin-bottom: 2rem;
        }
        .service:last-child {
          margin-bottom: 0;
        }
        .service-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .service-name {
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .service-name::before {
          content: "";
          display: block;
          width: 8px;
          height: 8px;
          border: 2px solid var(--text-main);
          border-radius: 50%;
        }
        .service-uptime-text {
          font-weight: 600;
        }
        
        /* Bar chart */
        .uptime-chart {
          display: flex;
          gap: 2px;
          height: 32px;
          margin-bottom: 0.5rem;
        }
        .bar {
          flex: 1;
          border-radius: 2px;
          opacity: 0.9;
          transition: opacity 0.2s;
        }
        .bar:hover {
          opacity: 1;
          cursor: pointer;
        }
        .bar-good {
          background-color: var(--accent-green-bar);
        }
        .bar-warn {
          background-color: var(--accent-warn);
        }
        .bar-bad {
          background-color: var(--accent-red);
        }
        .bar-nodata {
          background-color: var(--accent-nodata);
        }
        .chart-labels {
          display: flex;
          justify-content: space-between;
          color: var(--text-muted);
          font-size: 0.875rem;
        }
      </style>
    </head>
    <body>
      <nav>
        <div class="nav-brand">
          <img src="${FRONTEND_URL}/favicon.png" alt="Logo" style="width: 24px; height: 24px;">
          GeoFlags Status
        </div>
      </nav>

      <div class="hero">
        <div class="hero-icon ${dbStatus === 'Operational' ? '' : 'error'}">
          ${headerIcon}
        </div>
        <h1>${headerText}</h1>
        <p>Last updated on ${new Date().toLocaleString()}</p>
      </div>

      <div class="container">
        
        ${htmlBodyContent}

        <!-- Footer / Additional Systems could go here -->
      </div>
    </body>
    </html>
  `;

  return res.status(200).send(html);
}
