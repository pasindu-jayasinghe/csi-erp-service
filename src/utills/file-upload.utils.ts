import { HttpException, HttpStatus } from "@nestjs/common";
import { extname } from "path";

export  const editFileName = (req, file, callback) => {
    const name = file.originalname.split('.')[0];
    const fileExtName = extname(file.originalname);
    console.log(fileExtName)
    const randomName = Array(4)
        .fill(null)
        .map(() => Math.round(Math.random() * 10).toString(10))
        .join('');
    callback(null, `${name}${randomName}${fileExtName}`);
};

export const excelFileFilter = (req, file, callback) => {
    if (!file.originalname.match(/\.(xlsx)$/)) {
        return callback(
            new HttpException(
                'Only excel files are allowed!',
                HttpStatus.BAD_REQUEST,
            ),
            false,
        );
    }
    callback(null, true);
};