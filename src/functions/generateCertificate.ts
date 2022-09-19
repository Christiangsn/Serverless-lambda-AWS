import { document } from './../utils/dynamodbClient';
import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult, Context } from "aws-lambda";

import * as handhbslebars from 'handlebars';
import dayjs from 'dayjs'
import chromium from 'chrome-aws-lambda';
import { S3 } from 'aws-sdk';

import { join } from 'path';
import { readFileSync } from 'fs';


type ICreateCertificate = {
    id: string;
    name: string;
    grade: string;
}

type ITemplate = {
    id: string;
    name: string;
    grade: string;
    medal: string;
    date: string;
}


const compile = async (data: ITemplate) => {
    const filePath = join(process.cwd(), "src", "templates", "certificate.hbs")
    const html = readFileSync(filePath, 'utf-8')
    return handhbslebars.compile(html)(data)
}

export const run: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

    const response = await document.query({
        TableName: "users_certificate",
        KeyConditionExpression: "id = :id",
        ExpressionAttributeValues: {
            ":id": id
        }
    }).promise();

    const userAlreadyExists = response.Items[0]
    if(!userAlreadyExists) {
        await document.put({
            TableName: "users_certificate",
            Item:{ id, name, grade, created_at: new Date().getTime() }
        }).promise();
    }

    // Convert png a base64
    const medalPath = join(process.cwd(), "src", "templates", "selo.png");
    const medal = readFileSync(medalPath, "base64");

    const data: ITemplate = {
        name,
        id, 
        grade,
        date: dayjs().format("DD/MM/YYYY"),
        medal
    };

    const content = await compile(data)
    const browserr = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless
      });

      const page = await browserr.newPage();
      
      await page.setContent(content);
      const pdf = await page.pdf({
        format: "a4",
        landscape: true,
        printBackground: true,
        preferCSSPageSize: true,
        path: process.env.IS_OFFLINE ? "./certificate.pdf" : null
      });

      await browserr.close();

      const s3 = new S3();
      await s3.putObject({
        Bucket: "certificate-node",
        Key: `${id}.pdf`,
        ACL: 'public-read',
        Body: pdf,
        ContentType: "application/pdf"
      }).promise()

    return {
        statusCode: 201,
        body: JSON.stringify({
            message: "Certificado criado com sucesso!",
            url: `https://certificate-node.s3.amazonaws.com/${id}.pdf`
        })
    }
}
