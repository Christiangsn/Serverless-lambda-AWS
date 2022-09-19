import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import { document } from './../utils/dynamodbClient';

type IUserCertificate = {
    name: string
    id: string
    created_at: number
    grade: string
}

export const run: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { id } = event.pathParameters
    
    const response = await document.query({
        TableName: "users_certificate",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    const userCertificate = response.Items[0] as IUserCertificate
    
    if(userCertificate) {
        return {
            statusCode: 201,
            body: JSON.stringify({
                message: "Certificado Valido",
                name: userCertificate.name,
                url: `https://certificate-node.s3.amazonaws.com/${id}.pdf`
            })
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "Certificado invalido!"
        })
    }

}