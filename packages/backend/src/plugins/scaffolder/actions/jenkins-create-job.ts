import {
    createTemplateAction
  } from '@backstage/plugin-scaffolder-node';
  
import axios from 'axios';
import { Config } from '@backstage/config';

  // import  { Config } from '@backstage/config';
  
  /** 
   *  Create a new action just for test
   * @public
   */
  
  export  const jenkinsCreateJobAction = (options: {
    config: Config;
  }) => {
    const { config } = options;
    return createTemplateAction<{
        repoUrl?: string;
        folder?: string;
        job?: string;
    }>({
      id: 'jenkins:job:create',
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
        console.log("------------------Job Creation----------------");
        const password  = config.getOptionalString("jenkins.token");
        if (!password ) {
          console.error("Test Action Errored out, no Jenkins token Present");
          throw Error("Jenkins password not provided"); 
        }
        
        const username  = config.getOptionalString("jenkins.username");
        if (!username ) {
          console.error("Test Action Errored out, no Jenkins username Present");
          throw Error("Jenkins username not provided"); 
        }

        const jenkinsBaseUrl  = config.getOptionalString("jenkins.host");
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
          throw Error("Jenkins Folder not created"); 
        }
      } catch (error) {
        console.error('Error creating job:', error.message);
        throw Error("Jenkins Folder not created"); 
      }

      const message = `New job "${jobName}" created within folder "${folderName}"`;

      console.log(message);
    },
  });
};