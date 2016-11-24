import { Meteor } from 'meteor/meteor';
import { Records } from '../common/collections';

Meteor.methods({
  clearRecords:()=>{
    Records.remove({});
  },
  clearSingleRecord:(id)=>{
    if(!id) return false;
    Records.remove({_id:id});
  }
});