const hubspot = require('@hubspot/api-client');
const axios = require('axios')


exports.main = async (event, callback) => {

  //Get contact properties
  const email = event.inputFields['email'];
  const firstName = event.inputFields['firstname'];

  const utm_source = event.inputFields['utm_source'];
  const utm_campaign = event.inputFields['utm_campaign'];
  const utm_medium = event.inputFields['utm_medium'];
  const utm_term = event.inputFields['utm_term'];

  //Get API Key
  const apiKey=process.env.LivestormAPI;
  
  //Get Session ID
  const sessionId=event.inputFields['livestorm_session_id'];
  
  var body = {"data":{
    "type":"people",
    "attributes":{
      "fields":[
        {"id":"email",
        "value":email},
        {"id":"first_name",
        "value":firstName}
      ],
      "utm_source": utm_source,
      "utm_medium": utm_medium,
      "utm_campaign": utm_campaign,
      "utm_term": utm_term
    }}};
 
  const headers={
    Accept: 'application/vnd.api+json',
    'Content-Type': 'application/vnd.api+json',
    Authorization: apiKey
  };

  //POST Registrant to Session 
  axios.post('https://api.livestorm.co/v1/sessions/'+sessionId+'/people', body,{headers: headers})
  
  .then(function(response){
    callback({
      outputFields: {
        contact_connection_link: response.data.data.attributes.registrant_detail.connection_link
    }
  });
} )
  .catch(err => console.error(err));
}