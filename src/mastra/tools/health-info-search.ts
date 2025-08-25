import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { google_search, view_text_website } from 'agent-protocol';
import * as cheerio from 'cheerio';

export const healthInfoSearchTool = createTool({
    id: 'health-info-search',
    description: 'Search for health information from approved sources.',
    inputSchema: z.object({
        query: z.string().describe('The search query'),
    }),
    outputSchema: z.object({
        content: z.string(),
    }),
    execute: async ({ inputData }) => {
        if (!inputData) {
            throw new Error('Input data not found');
        }

        const { query } = inputData;

        const searchResults = await google_search(`site:who.int OR site:moh.gov.my OR site:mac.org.my OR site:cdc.gov ${query}`);

        if (searchResults.length === 0) {
            return {
                content: 'No information found.',
            };
        }

        const topResultUrl = searchResults[0].url;

        const pageContent = await view_text_website(topResultUrl);

        const $ = cheerio.load(pageContent);
        const mainContent = $('main').text() || $('body').text();

        return {
            content: mainContent.trim(),
        };
    },
});
