import {
    createTemplateAction
  } from '@backstage/plugin-scaffolder-node';
  
import axios from 'axios';
  
  /** 
   *  Create a new action just for test
   * @public
   */
  
  export  const jenkinsCreateFolderAction = () => { //{ config }: {config: Config}
    return createTemplateAction<{
      component_id: string;
      description?: string;
      destination?: string;
      owner?: string;
    }>({
      id: 'jenkins:folder:create',
      description: 'Create a new action just for test',
      async handler(ctx) {
        console.log("------------------Folder Creation----------------");
        const jenkinsBaseUrl = 'http://localhost:8080/';
        const username = 'admin';
        const password = 'xyz'; // Use API token or password for authentication

        const folderName = 'MyNewFolder';

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
          } else {
            console.error('Failed to create folder:', response.data);
          }

        } catch (error) {
          console.error('Error creating folder:', error.message);
          console.error(error.text);
        }
  
        const message = `Hi There, this is a new Custom action with id ${ctx.input.component_id} 
          created by ${ctx.input.owner}
          at the location ${ctx.input.destination}`;
  
        console.log(message);
  
  
      },
    });
  };