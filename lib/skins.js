var logging = require("./logging");
var Jimp = require("jimp");
var fs = require("fs");

var exp = {};

// extracts the face from an image +buffer+
// result is saved to a file called +outname+
// callback: error
exp.extract_face = function (buffer, outname, callback) {
  // change this function to use Jimp
  Jimp.read(buffer)
    .then(function (image) {
      image
        .crop(8, 8, 15, 15) // face
        .opacity(1) // remove transparency
        .write(outname, function (write_err) {
          if (write_err) {
            callback(write_err);
          } else {
            callback(null);
          }
        });
    })
    .catch(function (err) {
      callback(err);
    });
};

// extracts the helm from an image +buffer+ and lays it over a +facefile+
// +facefile+ is the filename of an image produced by extract_face
// result is saved to a file called +outname+
// callback: error
exp.extract_helm = function (rid, facefile, buffer, outname, callback) {
  Jimp.read(buffer)
    .then(function (image) {
      image
        .crop(32, 0, 63, 31) // helm
        .opacity(1) // remove transparency
        .write(outname, function (write_err) {
          if (write_err) {
            callback(write_err);
          } else {
            callback(null);
          }
        });
    })
    .catch(function (err) {
      callback(err);
    });
};

// resizes the image file +inname+ to +size+ by +size+ pixels
// callback: error, image buffer
exp.resize_img = function (inname, size, callback) {
  Jimp.read(inname)
    .then(function (image) {
      image
        .resize(size, size, Jimp.RESIZE_NEAREST_NEIGHBOR) // nearest-neighbor doesn't blur
        .getBuffer(Jimp.MIME_PNG, function (buf_err, buffer) {
          if (buf_err) {
            callback(buf_err, null);
          } else {
            callback(null, buffer);
          }
        });
    })
    .catch(function (err) {
      callback(err, null);
    });
};

// returns "mhf_alex" or "mhf_steve" calculated by the +uuid+
exp.default_skin = function (uuid) {
  // great thanks to Minecrell for research into Minecraft and Java's UUID hashing!
  // https://git.io/xJpV
  // MC uses `uuid.hashCode() & 1` for alex
  // that can be compacted to counting the LSBs of every 4th byte in the UUID
  // an odd sum means alex, an even sum means steve
  // XOR-ing all the LSBs gives us 1 for alex and 0 for steve
  var lsbs_even =
    parseInt(uuid[7], 16) ^
    parseInt(uuid[15], 16) ^
    parseInt(uuid[23], 16) ^
    parseInt(uuid[31], 16);
  return lsbs_even ? "mhf_alex" : "mhf_steve";
};

// helper method for opening a skin file from +skinpath+
// callback: error, image buffer
exp.open_skin = function (rid, skinpath, callback) {
  fs.readFile(skinpath, function (err, buf) {
    if (err) {
      callback(err, null);
    } else {
      callback(null, buf);
    }
  });
};

// write the image +buffer+ to the +outpath+ file
// the image is stripped down by lwip.
// callback: error
exp.save_image = function (buffer, outpath, callback) {
  Jimp.read(buffer)
    .then(function (image) {
      image.write(outpath, function (write_err) {
        if (write_err) {
          callback(write_err);
        } else {
          callback(null);
        }
      });
    })
    .catch(function (err) {
      callback(err);
    });
};

module.exports = exp;
