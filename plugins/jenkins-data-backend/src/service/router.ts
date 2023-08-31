import { errorHandler } from '@backstage/backend-common';
import express from 'express';
import Router from 'express-promise-router';
import { Logger } from 'winston';
import { Config } from '@backstage/config';
import axios from 'axios';

async function getJenkinsJobStatus(baseUrl: string, username: string, password: string, folderName: string, jobName: string): Promise<string> {
  try {
    // Set up basic authentication headers
    const auth = {
      username,
      password,
    };

    // Construct the Jenkins job URL
    const jobUrl = `${baseUrl}/job/${encodeURIComponent(folderName)}/job/${encodeURIComponent(jobName)}/lastBuild/api/json`;

    // Make a GET request to fetch the job status
    const response = await axios.get(jobUrl, { auth });

    if (response.status === 200) {
      // Parse the response JSON to get the job status
      const jobData = response.data;
      const jobStatus = jobData.result;

      if (jobStatus) {
        return jobData;
      } else {
        return 'Status not available';
      }
    } else {
      return 'Failed to fetch job status';
    }
  } catch (error) {
    console.error('Error fetching job status:', error.message);
    return 'Error';
  }
}


async function getJenkinsAllJobStatus(baseUrl: string, username: string, password: string, folderName: string, jobName: string): Promise<any[]> {
  try {
    // Set up basic authentication headers
    const auth = {
      username,
      password,
    };

    // Construct the Jenkins job URL to get the build history
    const jobUrl = `${baseUrl}/job/${encodeURIComponent(folderName)}/job/${encodeURIComponent(jobName)}/api/json`;

    // Make a GET request to fetch the job information
    const response = await axios.get(jobUrl, { auth });

    if (response.status === 200) {
      // Parse the response JSON to get the job information
      const jobData = response.data;
      const builds = jobData.builds;

      const statuses = await Promise.all(builds.map(async (build: any) => {
        const buildUrl = `${baseUrl}/job/${encodeURIComponent(folderName)}/job/${encodeURIComponent(jobName)}/${build.number}/api/json`;
        const buildResponse = await axios.get(buildUrl, { auth });

        if (buildResponse.status === 200) {
          const buildData = buildResponse.data;
          return {
            number: buildData.number,
            status: buildData.result,
          };
        } else {
          return {
            number: build.number,
            status: 'Failed to fetch',
          };
        }
      }));

      return statuses;
    } else {
      throw new Error('Failed to fetch job information');
    }
  } catch (error) {
    console.error('Error fetching job status:', error.message);
    throw error;
  }
}

export interface RouterOptions {
  logger: Logger;
  config: Config;
}

export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger,config } = options;

  const router = Router();
  router.use(express.json());

  router.get('/healthy', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  router.get('/hello', (_, response) => { // express js request query
    logger.info('GET Hello Request');
    response.json({ response: 'world' });
  });

  router.get('/config/:configId', (request , response) => {
    const { configId } = request.params ; // configId can be a key inside the config
    const value = config.getOptionalString(`githubCodeResource.${configId}`)
    logger.info('Got request to read a config');
    response.json({ response: value });
  });

  router.get('/getJenkinsStatus/:jobName', (request , response) => {
    const { jobName } = request.params ; // configId can be a key inside the config
    const folderName = "custom-actions";

    const password  = config.getOptionalString("jenkinsAction.token");
        if (!password ) {
          console.error("Test Action Errored out, no Jenkins token Present");
          throw Error("Jenkins password not provided"); 
        }
        
    const username  = config.getOptionalString("jenkinsAction.username");
        if (!username ) {
          console.error("Test Action Errored out, no Jenkins username Present");
          throw Error("Jenkins username not provided"); 
        }

    const jenkinsBaseUrl  = config.getOptionalString("jenkinsAction.host");
        if (!jenkinsBaseUrl ) {
          console.error("Test Action Errored out, no Jenkins username Present");
          throw Error("Jenkins URL not provided");  
        }
    
    getJenkinsJobStatus(jenkinsBaseUrl, username, password, folderName, jobName)
      .then(status => {
        console.log(`Job "${jobName}" status: ${JSON.stringify(status)} `);
        response.json({ response: status });
      })
      .catch(error => {
        console.error('Error:', error);
        response.json({ response: "Error!" });
      });
    
  });

  router.get('/getJenkinsAllStatus/:jobName', async (request, response) => {
    const { jobName } = request.params;
    const folderName = 'custom-actions';

    const password = config.getOptionalString('jenkinsAction.token');
    const username = config.getOptionalString('jenkinsAction.username');
    const jenkinsBaseUrl = config.getOptionalString('jenkinsAction.host');

    try {
      if (!password || !username || !jenkinsBaseUrl) {
        throw new Error('Required Jenkins configuration missing');
      }

      const status = await getJenkinsAllJobStatus(
        jenkinsBaseUrl,
        username,
        password,
        folderName,
        jobName,
      );

      logger.info(`Job "${jobName}" status: ${JSON.stringify(status)}`);
      response.json({ response: status });
    } catch (error) {
      logger.error('Error:', error);
      response.status(500).json({ response: 'Error!' });
    }
  });


  router.use(errorHandler());
  return router;
}
