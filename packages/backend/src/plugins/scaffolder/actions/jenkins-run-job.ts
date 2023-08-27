import {
    createTemplateAction
  } from '@backstage/plugin-scaffolder-node';
  
import axios from 'axios';
  // import  { Config } from '@backstage/config';
  
  /** 
   *  Create a new action just for test
   * @public
   */
  
  export  const jenkinsRunJobAction = () => { //{ config }: {config: Config}
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
        const jenkinsBaseUrl = 'http://localhost:8080/';
        const username = 'admin';
        const password = 'xyz'; // Use API token or password for authentication

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