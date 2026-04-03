import useSWR from 'swr';

export interface PreloaderSettings {
  logoUrl?: string;
  isActive: boolean;
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function usePreloaderSettings() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/preloader-settings',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 60000, 
    }
  );

  return {
    settings: (data?.settings as PreloaderSettings) || { isActive: false, logoUrl: "" },
    isLoading,
    isError: error,
    mutate,
  };
}
