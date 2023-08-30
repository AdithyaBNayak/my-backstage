import {
    createTemplateAction
  } from '@backstage/plugin-scaffolder-node';
  
import axios from 'axios';
import { Config } from '@backstage/config';
  
  /** 
   *  Create a new action just for test
   * @public
   */
  
  export  const jenkinsRunJobAction = (options: {
    config: Config;
  }) => { 
    const { config } = options;
    return createTemplateAction<{
      repoUrl?: string;
      folder?: string;
      job?: string;
    }>({
      id: 'jenkins:job:run',
      description: 'Create a new action just for test',
      schema: {
        input: {
          properties: {
            
            repoUrl: {
              type: 'string',
              title: 'GitHub Repo Url',
              description:
                'mkdocs.yml file location inside the github repo you want to store the document',
            },
            folder: {
                type: 'string',
                title: 'Jenkins Folder',
                description:
                  'Its a Jenkins Folder',
              },
            job: {
                type: 'string',
                title: 'JenkinsJob',
                description:
                  'Its a Jenkins',
            },  
          },
        },
      },
      async handler(ctx) {
        console.log("------------------Running the job----------------");
        
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

        const folderName = ctx.input.folder || 'MyNewFolder';
        const jobName = ctx.input.job || 'MyNewJob';

        try {
            // Set up basic authentication headers
            const auth = {
              username,
              password,
            };


        // Trigger the existing Jenkins job
        const triggerResponse = await axios.post(
          `${jenkinsBaseUrl}/job/${encodeURIComponent(folderName)}/job/${encodeURIComponent(
            jobName
          )}/build`,
          null,
          { auth }
        );

        if (triggerResponse.status === 201) {
          console.log(`Job "${jobName}" triggered successfully.`);
        } else {
          console.error('Failed to trigger job:', triggerResponse.data);
        }
      } catch (error) {
        console.error('Error:', error.message);
      }
    },
  });
};