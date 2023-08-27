import {
    createTemplateAction
  } from '@backstage/plugin-scaffolder-node';
  
import axios from 'axios';
import { Config } from '@backstage/config';
  
  /** 
   *  Create a new action just for test
   * @public
   */
  
  export  const jenkinsCreateFolderAction = (options: {
    config: Config;
  }) => { 
    const { config } = options;
    return createTemplateAction<{
      repoUrl?: string;
      folder?: string;
      job?: string;
    }>({
      id: 'jenkins:folder:create',
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
        console.log("------------------Folder Creation----------------");
        
        const password  = config.getOptionalString("jenkins.token");
        if (!password ) {
          console.error("Test Action Errored out, no Jenkins token Present");
          throw Error("No Token Provided");
        }

        const username  = config.getOptionalString("jenkins.username");
        if (!username ) {
          console.error("Test Action Errored out, no Jenkins username Present");
          throw Error("No Username Provided");
        }

        const jenkinsBaseUrl  = config.getOptionalString("jenkins.host");
        if (!jenkinsBaseUrl ) {
          console.error("Test Action Errored out, no Jenkins username Present");
          throw Error("No Jenkins Host URL Provided");
        }

        const folderName = ctx.input.folder || 'MyNewFolder';

        try {
            // Set up basic authentication headers
            const auth = {
              username,
              password,
            };


        // Create the folder using the Jenkins REST API
        const response = await axios.post(
            `${jenkinsBaseUrl}/createItem?name=${encodeURIComponent(
              folderName
            )}&mode=com.cloudbees.hudson.plugins.folder.Folder&Submit=OK`,
            null,
            { auth }
          );    
  
          if (response.status === 200) {
            console.log(`Folder "${folderName}" created successfully.`);
          } else if (response.status === 400) {
            console.log(`Folder "${folderName}" might already created!!.`); 
            throw Error("Jenkins Folder not created"); 
          } else {
            console.error('Failed to create folder:', response.data);
            throw Error("Jenkins Folder not created"); 
          }

        } catch (error) {
          console.error('Error creating folder:', error.message);
          throw Error("Jenkins Folder not created"); 
        }
    
      },
    });
  };