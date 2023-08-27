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
      component_id: string;
      description?: string;
      destination?: string;
      owner?: string;
    }>({
      id: 'jenkins:job:run',
      description: 'Create a new action just for test',
      async handler(ctx) {
        console.log("------------------Running the job----------------");
        const password  = config.getOptionalString("jenkins.token");
        if (!password ) {
          console.error("Test Action Errorred out, no Jenkins token Present");
          return
        }
        
        const username  = config.getOptionalString("jenkins.username");
        if (!username ) {
          console.error("Test Action Errorred out, no Jenkins username Present");
          return
        }

        const jenkinsBaseUrl  = config.getOptionalString("jenkins.host");
        if (!jenkinsBaseUrl ) {
          console.error("Test Action Errorred out, no Jenkins username Present");
          return
        }

        const folderName = 'MyNewFolder';
        const jobName = 'MyNewJob';

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