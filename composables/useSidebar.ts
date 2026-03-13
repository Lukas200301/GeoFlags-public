export const useSidebar = () => {
  const sidebarCollapsed = useState('sidebarCollapsed', () => false)

  const toggleSidebar = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value
  }

  const setSidebarCollapsed = (value: boolean) => {
    sidebarCollapsed.value = value
  }

  return {
    sidebarCollapsed,
    toggleSidebar,
    setSidebarCollapsed,
  }
}
