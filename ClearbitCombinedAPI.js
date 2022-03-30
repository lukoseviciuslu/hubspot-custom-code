const hubspot = require('@hubspot/api-client');
const axios = require('axios');

exports.main = async (event, callback) => {

    const hubspotClient = new hubspot.Client({
        apiKey: process.env.HAPIKEY
    });

    // Get Associated Company ID
    const getCompanyId = await hubspotClient.crm.contacts.associationsApi.getAll(event.object.objectId,'company');
    const companyId = getCompanyId.body.results[0].id;

    // Define parameters sent to Clearbit
    // Person
    var email = event.inputFields['email'];
    var firstname = event.inputFields['firstname'];
    var lastname = event.inputFields['lastname'];
    var ipaddress = event.inputFields['ip_address_form'];
    var country = event.inputFields['country'];
    // Company
    var companyname = event.inputFields['company']; 
    // var companydomain = event.inputFields[''];

    // Enrichment endpoint GET request
    axios.get("https://person.clearbit.com/v2/combined/find", {
        "params": {
            "email": email,
            "given_name": firstname,
            "family_name": lastname,
            "ip_address": ipaddress,
            "location": country,
            "company": companyname
        },
        "headers": {
            "Authorization": "Bearer " + process.env.CLEARBITKEY
        }
      })

      .then((response) => {
          // Update Company
          hubspotClient.crm.contacts.basicApi.update(event.object.objectId, {
              "properties": {
                  // Example: "hubspot property name": "response.data.property"
                  
                  // Employment
                  "jobtitle": response.data.person.employment.title,
                  "role": response.data.person.employment.role,
                  "sub_role": response.data.person.employment.subRole,
                  "seniority": response.data.person.employment.seniority,
                  "website": response.data.person.employment.domain,
                  
                  // Social
                  "linkedin_url": "www.linkedin.com/".concat(response.data.person.linkedin.handle),
                  "twitterhandle": response.data.person.twitter.handle,
                  "followercount": response.data.person.twitter.followers,
                  "linkedinbio": response.data.person.bio,
                  "twitterbio": response.data.person.bio,
                  
                  // Location
                  "country": response.data.person.geo.country,
                  "state": response.data.person.geo.state,
                  "city": response.data.person.geo.city,
                  "address": response.data.person.location,
                  
                  "clearbit_fuzzy": response.data.person.fuzzy
                
            }
        })
        
        // Update Company
        hubspotClient.crm.companies.basicApi.update(companyId, {
            "properties": {
                // General
                "name": response.data.company.name,
                "domain": response.data.company.domain, // Not sure if should override
                "description": response.data.company.description,
                "phone": response.data.company.phone,
                "company_tags": response.data.company.tags.join(","), // Array
                "company_logo": response.data.company.logo,
                "domain_aliases": response.data.company.domainAliases.join(","), // Array
                "parent_domain": response.data.company.parent.domain,
                "ultimate_parent_domain": response.data.company.ultimateParent.domain,
                
                // Industry
                "sector": response.data.company.category.sector,
                "industry_group": response.data.company.category.industryGroup,
                "industry_clearbit": response.data.company.category.industry,
                "sub_industry": response.data.company.category.subIndustry,

                // Tech
                "company_tech": response.data.company.tech.join(","), // Array

                // Social
                "twitterhandle": response.data.company.twitter.handle,
                "twitterbio": response.data.company.twitter.bio,
                "twitterfollowers": response.data.company.twitter.followers,
                "linkedin_company_page": "www.linkedin.com/".concat(response.data.company.linkedin.handle), 
                "facebook_company_page": response.data.company.facebook.handle,

                // Location
                "longitude": response.data.company.geo.lng,
                "latitude": response.data.company.geo.lat,
                "timezone": response.data.company.timeZone,
                "country": response.data.company.geo.country,
                "state": response.data.company.geo.state,
                "city": response.data.company.geo.city,
                "address": response.data.company.location,
                "zip": response.data.company.geo.postalCode,

                // Metrics
                "alexa_global": response.data.company.metrics.alexaGlobalRank,
                "alexa_us": response.data.company.metrics.alexaUsRank,
                "company_size_brackets": response.data.company.metrics.employeesRange,
                "numberofemployees": response.data.company.metrics.employees,
                "fiscal_year_end": response.data.company.metrics.fiscalYearEnd,
                "founded_year": response.data.company.foundedYear,
                "estimated_annual_revenue": response.data.company.metrics.estimatedAnnualRevenue
            }
        });

        callback({
            "outputFields":{
                "enrichmentError": response.data.error.type,
                "errorMessage": response.data.error.message
            }
        });
      
      })

    .catch((error) => {
        console.log(error);
        // throw error;
    });
}