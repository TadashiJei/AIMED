const { AzureKeyCredential } = require("@azure/core-auth");
const { TextAnalyticsClient } = require("@azure/ai-text-analytics");
const { DocumentAnalysisClient } = require("@azure/ai-form-recognizer");
const { OpenAIClient } = require("@azure/openai");

// Initialize Azure clients
const textAnalyticsClient = new TextAnalyticsClient(
  process.env.AZURE_LANGUAGE_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_LANGUAGE_KEY)
);

const formRecognizerClient = new DocumentAnalysisClient(
  process.env.AZURE_FORM_RECOGNIZER_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_FORM_RECOGNIZER_KEY)
);

const openAIClient = new OpenAIClient(
  process.env.AZURE_OPENAI_ENDPOINT,
  new AzureKeyCredential(process.env.AZURE_OPENAI_KEY)
);

// Statistical functions for anomaly detection
const calculateStats = (values) => {
  const n = values.length;
  const mean = values.reduce((a, b) => a + b, 0) / n;
  const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  const stdDev = Math.sqrt(variance);
  return { mean, stdDev };
};

const detectAnomalies = (timeSeriesData, threshold = 2) => {
  const values = timeSeriesData.map(point => point.value);
  const { mean, stdDev } = calculateStats(values);

  return timeSeriesData.map(point => ({
    timestamp: point.timestamp,
    value: point.value,
    isAnomaly: Math.abs(point.value - mean) > threshold * stdDev,
    expectedValue: mean,
    deviationScore: Math.abs(point.value - mean) / stdDev
  }));
};

// Analyze medical text using Azure Text Analytics
const analyzeMedicalText = async (text) => {
  try {
    // Analyze healthcare entities
    const healthOperation = await textAnalyticsClient.beginAnalyzeHealthcare([{ text }]);
    const healthResults = await healthOperation.pollUntilDone();
    
    // Extract relevant entities
    const entities = [];
    for await (const result of healthResults) {
      for (const entity of result.entities) {
        entities.push({
          text: entity.text,
          category: entity.category,
          subCategory: entity.subCategory,
          confidence: entity.confidenceScore,
          offset: entity.offset,
          length: entity.length,
          links: entity.links
        });
      }
    }

    // Analyze key phrases
    const keyPhrasesResults = await textAnalyticsClient.extractKeyPhrases([text]);
    const keyPhrases = keyPhrasesResults[0].keyPhrases;

    // Analyze sentiment
    const sentimentResult = await textAnalyticsClient.analyzeSentiment([text]);
    const sentiment = sentimentResult[0];

    return {
      entities,
      keyPhrases,
      sentiment: {
        overall: sentiment.sentiment,
        scores: sentiment.confidenceScores
      }
    };
  } catch (error) {
    console.error('Error analyzing medical text:', error);
    throw new Error('Failed to analyze medical text');
  }
};

// Extract information from medical documents
const analyzeMedicalDocument = async (documentUrl) => {
  try {
    const poller = await formRecognizerClient.beginAnalyzeDocumentFromUrl(
      "prebuilt-document",
      documentUrl
    );
    const { documents } = await poller.pollUntilDone();
    return documents[0];
  } catch (error) {
    console.error('Error analyzing medical document:', error);
    throw new Error('Failed to analyze medical document');
  }
};

// Generate health insights using Azure OpenAI
const generateHealthInsights = async (patientData) => {
  const prompt = `
    Based on the following patient data, provide health insights and recommendations:
    ${JSON.stringify(patientData, null, 2)}
  `;

  try {
    const result = await openAIClient.getCompletions(
      "gpt-4", // deployment name
      [prompt],
      {
        temperature: 0.7,
        maxTokens: 800
      }
    );

    return result.choices[0].text.trim();
  } catch (error) {
    console.error('Error generating health insights:', error);
    throw new Error('Failed to generate health insights');
  }
};

// Analyze historical health trends
const analyzeHealthTrends = async (metrics, timeframe) => {
  try {
    // Convert timeframe to days
    const timeframeDays = parseInt(timeframe) || 30;
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - timeframeDays);

    // Filter metrics by timeframe
    const filteredMetrics = metrics.filter(m => new Date(m.date) >= cutoffDate);

    // Group metrics by type
    const metricsByType = filteredMetrics.reduce((acc, metric) => {
      if (!acc[metric.type]) {
        acc[metric.type] = [];
      }
      acc[metric.type].push({
        timestamp: metric.date,
        value: metric.value
      });
      return acc;
    }, {});

    // Analyze each metric type
    const analysis = {};
    for (const [type, data] of Object.entries(metricsByType)) {
      const anomalies = detectAnomalies(data);
      const values = data.map(m => m.value);
      
      analysis[type] = {
        stats: {
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          min: Math.min(...values),
          max: Math.max(...values),
          anomalyCount: anomalies.filter(a => a.isAnomaly).length
        },
        anomalies: anomalies,
        trendDirection: values[values.length - 1] > values[0] ? 'increasing' : 'decreasing',
        dataPoints: values.length
      };
    }

    return analysis;
  } catch (error) {
    console.error('Error analyzing health trends:', error);
    throw new Error('Failed to analyze health trends');
  }
};

module.exports = {
  analyzeMedicalText,
  analyzeMedicalDocument,
  generateHealthInsights,
  analyzeHealthTrends,
  detectAnomalies
};
