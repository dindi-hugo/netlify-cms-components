const fs = require('fs');
const path = require('path');

const projectRoot = path.join(process.cwd());
console.log(`Root path is ${ projectRoot }`);

const siteRoot = {
  dir: path.join(projectRoot, "example")
};
const setPath = (relPath) => {
  siteRoot.dir = path.join(projectRoot, relPath);
  console.log(`Site path is ${ siteRoot.dir }`);
};

module.exports = {
  site: { setPath },
  files: (dirname) => {
    const name = "Files";
    const read = (cb) => {
      if (!cb) throw new Error(`Invalid call to ${name} - requires a callback function(content)`);
      const thispath = path.join(siteRoot.dir, dirname);
      const files = fs.existsSync(thispath) ? fs.readdirSync(thispath) : [];
      const filelist = [];
      files.forEach(function(element) {
        const filePath = path.join(thispath, element);
        const stats = fs.statSync(filePath);
        if (stats.isFile()) {
          filelist.push({ name: element, path: `${ dirname }/${ element }`, stats, type: "file" });
        }
      }, this);
      cb(filelist);
    };
    return { read, name };
  },
  file: (id) => {
    const name = "File";
    const thisfile = path.join(siteRoot.dir, id);
    let stats;
    if (!fs.existsSync(thisfile)) throw new Error(`Invalid call to ${name} - File does not exist(${thisfile})`);
    try {
      stats = fs.statSync(thisfile);
    } catch (err) {
      stats = { };
    }

    /* GET-Read an existing file */
    const read = (cb) => {
      if (!cb) throw new Error(`Invalid call to ${name} - requires a callback function(content)`);
      if (typeof stats.isFile === "function" && stats.isFile()) {
        fs.readFile(thisfile, 'utf8', (err, data) => {
          if (err) {
            cb({ error: err });
          } else {
            cb(data);
          }
        });
      } else {
        throw new Error(`Invalid call to ${name} - object path is not a file(${thisfile})`);
      }
    };
    /* POST-Create a NEW file, ERROR if exists */
    const create = (body, cb) => {
      fs.writeFile(thisfile, body.content, { encoding: body.encoding, flag: 'wx' }, (err) => {
        if (err) {
          cb({ error: err });
        } else {
          cb(body.content);
        }
      });
    };
    /* PUT-Update an existing file */
    const update = (body, cb) => {
      fs.writeFile(thisfile, body.content, { encoding: body.encoding, flag: 'w' }, (err) => {
        if (err) {
          cb({ error: err });
        } else {
          cb(body.content);
        }
      });
    };
    /* DELETE an existing file */
    const del = (cb) => {
      fs.unlink(thisfile, (err) => {
        if (err) {
          cb({ error: err });
        } else {
          cb(`Deleted File ${ thisfile }`);
        }
      });
    };
    return { read, create, update, del, stats };
  },
};
