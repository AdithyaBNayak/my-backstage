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
    
    const output = getJenkinsJobStatus(jenkinsBaseUrl, username, password, folderName, jobName)
      .then(status => {
        console.log(`Job "${jobName}" status: ${status}`);
      })
      .catch(error => {
        console.error('Error:', error);
      });
    response.json({ response: output });
  });


  router.use(errorHandler());
  return router;
}
