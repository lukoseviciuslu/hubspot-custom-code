const hubspot = require('@hubspot/api-client');
const axios = require('axios');

exports.main = async (event, callback) => {

    const hubSpotClient = new hubspot.Client({
        apiKey: process.env.HAPIKEY 
    })

    var email = event.inputFields['email'];

    //Request to Kickbox Email Verification API
    axios.get("https://api.kickbox.com/v2/verify", {
            "params": {
                "email": email,
                "apikey": process.env.KICKBOXAPI
            }
        })
        .then((response) => { // Run code when we get response

            callback({
                outputFields: {
                    "kb_result": response.data.result,
                    "kb_free": response.data.free,
                    "kb_disposable": response.data.disposable
                }
            });

            hubSpotClient.crm.contacts.basicApi.update(event.object.objectId, {
                "properties": {
                    "kb_result": response.data.result,
                    "kb_reason": response.data.reason,
                    "kb_role": response.data.role,
                    "kb_free": response.data.free,
                    "kb_disposable": response.data.disposable,
                    "kb_accept_all": response.data.accept_all,
                    "kb_did_you_mean": response.data.did_you_mean,
                    "kb_sendex": response.data.sendex,
                    "kb_success": response.data.success
                }
            })
        })
        .catch((error) => {
            console.log(error); // Output any errors
        });
}