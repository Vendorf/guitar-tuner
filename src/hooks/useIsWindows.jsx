const useIsWindows = () => {
    return navigator.userAgent.includes("Windows")
}

export default useIsWindows