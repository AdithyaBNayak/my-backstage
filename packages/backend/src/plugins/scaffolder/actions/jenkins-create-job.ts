import {
    createTemplateAction
  } from '@backstage/plugin-scaffolder-node';
  
import axios from 'axios';

  // import  { Config } from '@backstage/config';
  
  /** 
   *  Create a new action just for test
   * @public
   */
  
  export  const jenkinsCreateJobAction = () => { //{ config }: {config: Config}
    return createTemplateAction<{
      component_id: string;
      description?: string;
      destination?: string;
      owner?: string;
    }>({
      id: 'jenkins:job:create',
      description: 'Create a new action just for test',
      async handler(ctx) {
        console.log("------------------Job Creation----------------");
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


        // Define the job configuration XML (replace with your actual job XML)
        const jobXml = `<?xml version='1.0' encoding='UTF-8'?>
        <flow-definition plugin="workflow-job@2.40">
          <actions/>
          <description>Sample Jenkins Pipeline Job</description>
          <keepDependencies>false</keepDependencies>
          <properties/>
          <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps@2.87">
            <script>pipeline {
            agent any
            stages {
                stage('Build') {
                    steps {
                        sh 'echo "Hello, Jenkins!"'
                    }
                }
            }
        }</script>
            <sandbox>false</sandbox>
          </definition>
          <triggers/>
          <disabled>false</disabled>
        </flow-definition>
        `;

        // Create the job using the Jenkins REST API
        const response = await axios.post(
          `${jenkinsBaseUrl}/job/${encodeURIComponent(folderName)}/createItem?name=${encodeURIComponent(
            jobName
          )}`,
          jobXml,
          { auth, headers: { 'Content-Type': 'application/xml' } }
        );

        if (response.status === 200) {
          console.log(`Job "${jobName}" created successfully.`);
        } else {
          console.error('Failed to create job:', response.data);
        }
      } catch (error) {
        console.error('Error creating job:', error.message);
      }

      const message = `New job "${jobName}" created within folder "${folderName}"`;

      console.log(message);
    },
  });
};