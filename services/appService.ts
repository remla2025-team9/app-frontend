export interface ServiceVersionInfo {
    'app-service-version': string;
    'model-service-version': string;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_SERVICE_URL;

export async function fetchAppServiceVersion(): Promise<ServiceVersionInfo> {
  
    if (!baseUrl) {
      const errorMessage = 'Configuration Error: NEXT_PUBLIC_APP_SERVICE_URL is not defined.';
      console.error(errorMessage);

      throw new Error(errorMessage);
    }
  
    const url = `${baseUrl.replace(/\/$/, '')}/version`;
  
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });
  
      const data = await response.json();
   
      return data as ServiceVersionInfo;
    } catch (error) {
      throw new Error(`Error fetching app service version: ${error}`);
    }
}