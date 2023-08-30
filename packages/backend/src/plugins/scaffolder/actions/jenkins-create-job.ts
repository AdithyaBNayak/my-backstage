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
        console.log(ctx.input.repoUrl)

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

        const folderName = ctx.input.folder || 'custom-actions';
        const jobName = ctx.input.job || 'MyNewJob';

        try {
            // Set up basic authentication headers
            const auth = {
              username,
              password,
            };


        // Define the job configuration XML (replace with your actual job XML)
        const jobXml = `<?xml version='1.0' encoding='UTF-8'?>
        <project>
          <description>Sample Jenkins Freestyle Project</description>
          <properties>
            <com.coravy.hudson.plugins.github.GithubProjectProperty>
                <projectUrl>https://github.com/ItRachii/Spring-Boot-E-Commerce</projectUrl>
            </com.coravy.hudson.plugins.github.GithubProjectProperty>
          </properties>
          
          <!-- Git SCM Configuration -->
        <scm class="hudson.plugins.git.GitSCM">
            <configVersion>2</configVersion>
            <userRemoteConfigs>
            <hudson.plugins.git.UserRemoteConfig>
                <url>https://github.com/ItRachii/Spring-Boot-E-Commerce.git</url>
            </hudson.plugins.git.UserRemoteConfig>
            </userRemoteConfigs>
            <branches>
            <hudson.plugins.git.BranchSpec>
                <name>*/main</name>
            </hudson.plugins.git.BranchSpec>
            </branches>
            <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
            <submoduleCfg/>
            <extensions/>
        </scm>

        <!-- Build Trigger with GitHub Hook Trigger -->
        <triggers>
            <com.cloudbees.jenkins.GitHubPushTrigger>
            <spec></spec> <!-- You can specify specific branches, or leave empty for all -->
            </com.cloudbees.jenkins.GitHubPushTrigger>
        </triggers>


          <builders>
            <hudson.tasks.Shell>
              <command>
                #!/bin/bash
                
                # Navigate to your project directory
                pwd
                
                # Initialize Terraform
                terraform init
                
                # Plan the changes
                terraform plan
                
                # Apply the changes
                terraform apply -auto-approve
              </command>
            </hudson.tasks.Shell>
          </builders>
        </project>`;  
        
        
        
        
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
          throw Error("Jenkins Job  not created - Else statement"); 
        }
      } catch (error) {
        console.error('Error creating job:', error.message);
        throw Error("Jenkins Job not created - catch statement"); 
      }

      const message = `New job "${jobName}" created within folder "${folderName}"`;

      console.log(message);
    },
  });
};