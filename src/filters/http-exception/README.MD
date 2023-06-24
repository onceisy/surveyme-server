为了减少样板代码，```Nest``` 提供了一系列继承自核心异常 ```HttpException``` 的可用异常。所有这些都可以在 ```@nestjs/common```包中找到：

- BadRequestException 400
- UnauthorizedException 401
- NotFoundException 404
- ForbiddenException 403
- NotAcceptableException 406
- RequestTimeoutException 408
- ConflictException 409
- GoneException 410
- PayloadTooLargeException 413
- UnsupportedMediaTypeException 415
- UnprocessableException 422
- InternalServerErrorException 500
- NotImplementedException 501
- BadGatewayException 502
- ServiceUnavailableException 503
- GatewayTimeoutException 504

### 使用

```javascript
  throw new BadRequestException({
    code: 210
    message: 'request failed!',
    // ...
  });
```