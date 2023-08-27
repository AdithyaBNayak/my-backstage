import {
    createTemplateAction
  } from '@backstage/plugin-scaffolder-node';
  
  import fetch from 'node-fetch';
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
        // const configValue  = config.getOptionalString("integrations.testingAction.testing");
        // if (!configValue ) {
        //   console.error("Test Action Errorred out, no ConfigValue Present");
        //   return;
        // }
  
        const message = `Hi There this is new Custom action with id ${ctx.input.component_id} 
        has been created by ${ctx.input.owner}
        at the location ${ctx.input.destination}, \n
        configValue = `;
   
        
        console.log('Hoi, This is custom action created by Adithya B!!! ');
  
  
      },
    });
  };