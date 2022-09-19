## DYNAMODB

# @INSTALL
-- serverless dynamodb install (PRESENT JAVA IN YOUR MACHINE!!!!)
# @START
-- serverless dynamodb start

--------------------------------------

## CONFIGURATIONS KEY ACCESS AWS (DEPLOY)

# @SET A ENVIRONMENT 
-- serverless config credentials --provider aws --key=YOURKEY--secret YOURSECRET
# @SUBSTITUTE A ENVIRONMENT
-- serverless config credentials --provider aws --key=YOURKEY--secret YOURSECRET -o
# @VERIFY A ENVIRONMENT
-- cd ~/.aws

--------------------------------------
## DEPLOY

# @COMAND
-- serverless deploy --verbose

# @PERMISSIONS
in your config ts.serverless 
-> iamRoleStatements = READ IN DOCUMENTATION AS CONFIGURATIONS FOR PERMISSIONS