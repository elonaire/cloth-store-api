const { Product,ProductFile,File } = require("../models");
const generateUUID = require("uuid/v4");
const mockFiles = require("../seeders/products").files;

let getProducts = async (req, res, next) => {
  // fetch all
  try {
    let products = await Product.findAll({
      where: {}
    });

    if (products) {
      res.status(200).json(products);
    } else {
      throw {
        error: "Products not found",
        statusCode: 404
      };
    }
  } catch (error) {
    res.status(error.statusCode).json(error);
  }

  // fetch by filters - TODO
};

let addProduct = async (req, res, next) => {
  let requestDetails = req.body;

  let product = {};
  // check if product_id is defined - (for tests, it is already defined)
  product["product_id"] = requestDetails.product_id
    ? requestDetails.product_id
    : generateUUID();

  console.log("pid", product["product_id"]);

  for (let field of Object.keys(requestDetails)) {
    product[field] = requestDetails[field];
  }

  try {
    let createdProduct = await Product.create(product);
    if (!createdProduct) {
      throw {
        error: "Unable to create product",
        statusCode: 400
      };
    }
  } catch (error) {
    res.status(error.statusCode).json(error);
  }

  let productPictures = [];
  let files;

  if (process.env.NODE_ENV === "test") {
    files = mockFiles;
  } else {
    files = req.files;
  }
  console.log("files", files);

  for (let fileDetails of files) {
    let mimetype = fileDetails.mimetype;
    let begin = mimetype.lastIndexOf("/") + 1;
    let extension = mimetype.substr(begin);
    let filename = fileDetails.filename
      ? fileDetails.filename
      : `${generateUUID() + "." + extension}`;

    let file = {};
    file["file_name"] = filename;
    file["file_id"] = generateUUID();
    productPictures.push(file);
  }

  console.log("productPictures", productPictures);

  for (let productPicture of productPictures) {
    try {
      let cFile = await File.create(productPicture);
      let pFile = await ProductFile.create({
        product_id: product["product_id"],
        file_id: productPicture.file_id
      });

      if (!cFile || !pFile) {
        throw {
          error: "Unable to upload file",
          statusCode: 400
        };
      }
    } catch (error) {
      res.status(error.statusCode).json(error);
    }
  }

  res.status(201).json({
    message: "created"
  });
};

let editProduct = async (req, res, next) => {
  const changes = req.body;

  let prodId = req.params.id;
  try {
    let product = await Product.findOne({
      where: {
        product_id: prodId
      }
    });

    if (!product) {
      throw {
        error: "Product not found",
        statusCode: 404
      };
    }

    let editedProduct = null;
    if (product) {
      editedProduct = await Product.update(changes, {
        where: {
          product_id: prodId
        }
      });

      if (editedProduct) {
        res.status(200).json({
          message: 'Edit Successful'
        });
      } else {
        throw {
          error: "Product was not edited",
          statusCode: 400
        };
      }
    }
  } catch (error) {
    res.status(error.statusCode).json({
      error
    });
  }
};

let deleteProduct = async (req, res, next) => {
  let product_id = req.params.id;

  try {
    let deletedProduct = await Product.destroy({
      where: {
        product_id
      }
    });

    if (!deletedProduct) {
      throw {
        error: "Product was not deleted",
        statusCode: 400
      };
    }

    res.status(200).json({
      deletedProduct
    });
  } catch (error) {
    res.status(error.statusCode).json(error);
  }
};

module.exports = {
  getProducts,
  addProduct,
  editProduct,
  deleteProduct
};
