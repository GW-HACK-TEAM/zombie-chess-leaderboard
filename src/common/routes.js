import { Meteor } from 'meteor/meteor';
import { BlazeLayout } from 'meteor/kadira:blaze-layout';
import { FlowRouter } from 'meteor/kadira:flow-router';

FlowRouter.route('/', {
  name: 'Output',
  action: (params, queryParams) => {
    BlazeLayout.render('mainLayout', { content: 'output' });
  }
});

