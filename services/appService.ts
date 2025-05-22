export interface ServiceVersionInfo {
    'app-service-version': string;
    'model-service-version': string;
}

export interface SentimentPrediction {
    prediction: number;
};

let baseUrl: string | null = null;

async function getBaseUrl() {
    if (baseUrl) return baseUrl;
    
    const response = await fetch('/api/config');
    const config = await response.json();
    baseUrl = config.appServiceUrl;
    return baseUrl;
}

export async function fetchAppServiceVersion(): Promise<ServiceVersionInfo> {
    const url = await getBaseUrl();
    
    if (!url) {
        const errorMessage = 'Configuration Error: APP_SERVICE_URL is not defined.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
  
    const versionUrl = `${url.replace(/\/$/, '')}/version`;
  
    try {
      const response = await fetch(versionUrl, {
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

export async function predictSentimentReview(review: string): Promise<SentimentPrediction> {
    const url = await getBaseUrl();
    
    if (!url) {
        const errorMessage = 'Configuration Error: APP_SERVICE_URL is not defined.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    const predictUrl = `${url.replace(/\/$/, '')}/predict-sentiment-review`;

    try {
        const body = JSON.stringify({ 
          'review': review
        });
        const response = await fetch(predictUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body,
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data as SentimentPrediction;
    } catch (error) {
        throw new Error(`Error predicting sentiment: ${error}`);
    }
}

export async function confirmPrediction(action: string, originalLabel: string, correctedLabel?: string): Promise<void> {
    const url = await getBaseUrl();    
    
    if (!url) {
        const errorMessage = 'Configuration Error: APP_SERVICE_URL is not defined.';
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    const confirmUrl = `${url.replace(/\/$/, '')}/reviews/confirm`;

    try {
        const body = JSON.stringify({ 
          'action': action,
          'originalLabel': originalLabel,
          'correctedLabel': correctedLabel,
        });
        const response = await fetch(confirmUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: body,
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        return
    }
    catch (error) {
        throw new Error(`Error confirming prediction: ${error}`);
    }
}
