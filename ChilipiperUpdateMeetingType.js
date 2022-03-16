const hubspot = require('@hubspot/api-client');
const axios = require('axios');


exports.main = async (event, callback) => {

    const hubspotClient = new hubspot.Client({
        apiKey: process.env.HAPIKEY
    });

    // Get Meeting ID
    const getMeetingId = await hubspotClient.crm.contacts.associationsApi.getAll(event.object.objectId,'Meetings');
    const meetingId = getMeetingId.body.results.reverse()[0].id; // Reverse to get latest meeting ID

    // Update Meeting Type
    axios.patch("https://api.hubapi.com/crm/v3/objects/meetings/"+meetingId+"?hapikey="+process.env.HAPIKEY, 
    {
        "properties" : {
            "hs_activity_type": "Demo"
        } 
    },
    {
        "headers": {
            "content-type": "application/json"
        }
    })
}