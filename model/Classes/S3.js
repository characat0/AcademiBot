const FileStorage = require('../Interfaces/FileStorage');
const AWS = require('aws-sdk');

class S3 extends FileStorage {
    constructor(accessKey, secretKey, region, bucket) {
        super();
        this.s3 = new AWS.S3({
            accessKeyId : accessKey,
            secretAccessKey : secretKey,
            region : region
        });
        this.bucket = bucket;
    }
}
S3.prototype.listObjectsUnder = async function (prefix, continuationToken, previusResult) {
    previusResult = previusResult || [];
    const params = {
        Bucket : this.bucket,
        EncodingType : 'url',
        Prefix : prefix
    };
    if (continuationToken) params['continuationToken'] = continuationToken;
    const respuesta = await this.s3.listObjectsV2(params).promise();
    const resultado = [...previusResult, ...respuesta.Contents.map(objeto => objeto.Key)];
    if (respuesta.IsTruncated) {
        return this.listObjectsUnder(prefix, respuesta.NextContinuationToken, resultado);
    } else {
        return resultado;
    }
};
S3.prototype.listObjectsDirectlyUnder = async function (prefix, continuationToken, previusResult) {
    previusResult = previusResult || [];
    const params = {
        Bucket : this.bucket,
        EncodingType : 'url',
        Prefix : prefix,
        Delimiter : '/'
    };
    if (continuationToken) params['continuationToken'] = continuationToken;
    const respuesta = await this.s3.listObjectsV2(params).promise();
    const resultado = [...previusResult, ...respuesta.CommonPrefixes.map(objeto => objeto.Prefix)]
        .filter((value, index, self) => self.indexOf(value) === index);
    if (respuesta.IsTruncated) {
        return this.listObjectsUnder(prefix, respuesta.NextContinuationToken, resultado);
    } else {
        return resultado;
    }
};
S3.prototype.getObject = function (key) {
    const params = {
        Bucket : this.bucket,
        Key : key
    };
    return this.s3.getObject(params).promise();
};
S3.prototype.putObject = function (key, parameters) {
    if (!parameters.hasOwnProperty('Body')) throw new Error("Parametro Body no encontrado.");
    const params = {
        Body : parameters['Body'],
        Bucket : this.bucket,
        Key : key
    };
    if (parameters.hasOwnProperty('ContentType')) params['ContentType'] = parameters['ContentType'];
    if (parameters.hasOwnProperty('ContentLength')) params['ContentLength'] = parameters['ContentLength'];
    return this.s3.putObject(params).promise();
};
S3.prototype.copyObject = function (from, to) {
    const params = {
        CopySource: `/${this.bucket}/${from}`,
        Bucket: this.bucket,
        Key: to
    };
    return this.s3.copyObject(params);
};
S3.prototype.deleteObject = function (key) {
    const params = {
        Bucket : this.bucket,
        Key : key
    };
    return this.s3.deleteObject(params).promise();
};
S3.prototype.moveObject = function (from, to) {
    return this.copyObject(from, to)
        .then(() => this.deleteObject(from))
};
S3.prototype.renameObject = function (key, newName) {
    const lista = key.split('/');
    const fileName = lista[lista.length - 1];
    lista.pop();
    const extension = fileName.substr(fileName.lastIndexOf('.'));
    const newKey = lista.join('/') + '/' + newName + extension;
    return this.moveObject(key, newKey);
};
S3.prototype.getPublicURL = function (key) {
    const params = {
        Bucket : this.bucket,
        Key : key,
        Expires : 300
    };
    return this.s3.getSignedUrlPromise('getObject', params);
};

module.exports = S3;