#!/usr/bin/env node

const inquirer = require("inquirer");
const chalk = require("chalk");
const figlet = require("figlet");
const shell = require("shelljs");
const fs = require('fs')
const ora = require('ora')

const toTitleCase = (str) => {
    const string = str.replace(/-/g, ' ')
    return string.replace(/\w\S*/g, function(txt){
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }).split(' ').join('');
}

const askQuestions = () => {
    console.log('Keep in mind that your element has to have at least a hyphen. Ex: my-element. And only letters.')
    const questions = [
      {
        name: "filename",
        type: "input",
        message: "What is the name of your component?"
      },
      {
        name: "runner",
        type: "list",
        message: "What package manager do you use?",
        choices: ['.npm', '.yarn'],
        filter: function(val) {
            return val.split(".")[1];
          }
        
      }
      
    ];
    return inquirer.prompt(questions);
  };
  const createFile = (filename) => {
      console.log(filename)
    const filePath = `${filename}.ts`
    console.log(filePath)
    const file = `
import { LitElement, html, customElement, property, css } from "lit-element";

@customElement("${filename}")
export class ${toTitleCase(filename)} extends LitElement {
  @property()
  customString: string = "test";

  render() {
    return html\`
    <style>  

    </style>
      <div>
     \${this.customString}
          
      </div>
    \`;
  }
}`
    
    shell.mkdir(filename)

    fs.writeFileSync(`${filename}/${filePath}`, file, (err,res) => {
        if(err) console.log(err)
        console.log(res)
    })
    fs.writeFileSync(`${filename}/.babelrc`, `
    {
        "presets": ["env"]
    }
    `, (err,res) => {
        if(err) console.log(err)
        console.log(res)
    })
    fs.writeFileSync(`${filename}/.gitignore`, `
    node_modules
    dist
    `, (err,res) => {
        if(err) console.log(err)
        console.log(res)
    })
    shell.mkdir(filename +'/demo')
    const html = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Your awesome component ${filename}</title>
    <script src="../${filename}.ts"></script>
</head>
<body>
    <${filename}></${filename}>
</body>
</html>
    `
    fs.writeFileSync(`${filename}/demo/index.html`, html, (err,res) => {
      if(err) console.log(err)
      console.log(res)
  })
  const package = `
  {
    "name": "${filename}",
    "version": "0.0.1",
    "main": "dist/${filename}.js",
    "files": [
      "dist/"
    ],
    
    "dependencies": {
      "lit-element": "^2.2.1"
    },
    "scripts": {
      "dev": "parcel demo/index.html --open",
      "build": "parcel build ${filename}.ts"
    },
    "devDependencies": {
      "awesome-typescript-loader": "^5.2.1",
      "cssnano": "^4.1.10",
      "parcel": "^1.12.3",
      "ts-loader": "^6.0.2",
      "typescript": "^3.5.2",
      "typescript-lit-html-plugin": "^0.9.0"
    },
    "browserslist": "last 2 Chrome versions",
    "license": "MIT"
  }
  
  `
fs.writeFileSync(`${filename}/package.json`, package, (err,res) => {
    if(err) console.log(err)
    console.log(res)
})

const tslint = `
{
  "extends": "tslint:recommended",
  "rules": {
    "max-line-length": {
      "options": [100]
    },
    "member-ordering": false,
    "no-consecutive-blank-lines": false,
    "object-literal-sort-keys": false,
    "ordered-imports": false,
    "quotemark": [true, "single"],
    "variable-name": [true, "allow-leading-underscore"],
    "skipUnknownAttributes": true
  }
}

`
const tsconfig = `
{
  "compilerOptions": {
    "strict": true,
    "baseUrl": "src",
    "outDir": "dist",
    "sourceMap": true,
    "removeComments": true,
    "experimentalDecorators": true,
    "target": "esnext",
    "emitDecoratorMetadata": true,
    "module": "esnext",
    "importHelpers": true,
    "moduleResolution": "node",
    "lib": ["es2017", "dom"]
  },
  "include": ["./src/**/*.ts", "src/components/icon/index.js"],
  "exclude": ["node_modules"],
  "plugins": [{
    "name": "typescript-lit-html-plugin",
    "tags": ["html", "template"],
    "format": {
      "enabled": true
    }
  }]
}`
const gitignore = `node_modules
.cache
dist
public`
fs.writeFileSync(`${filename}/tsconfig.json`, tsconfig , (err,res) => {
    if(err) console.log(err)
    console.log(res)
})
fs.writeFileSync(`${filename}/tslint.json`, tslint, (err,res) => {
    if(err) console.log(err)
    console.log(res)
})
fs.writeFileSync(`${filename}/.gitignore`, gitignore, (err,res) => {
    if(err) console.log(err)
    console.log(res)
})
    return filePath;

  };
const init = () => {
    console.log(
      chalk.green(
        figlet.textSync("SMDesign", {
          font: "Doom",
          horizontalLayout: "default",
          verticalLayout: "default"
        })
      )
    );
  }
  const success = (filepath) => {
    console.log(
      chalk.white.bgBlue.bold(`Done! File created at ${filepath}`)
    );
  };
  const installNpm = (filename, runner) => {
      shell.cd(filename)

      shell.exec(`${runner} install`)

      
      
      return
  }
const run = async () => {
    init();

  
  // ask questions
  const answers = await askQuestions();
  const { filename, runner } = answers;

  // create the file
  const filePath = createFile(filename);
  const spinner = ora().start(`${runner} is running`)

  await installNpm(filename, runner)
  spinner.succeed(`${runner} installed all your packages. You can now cd into ${filename} and run ${runner === 'yarn' ? 'yarn dev' : 'npm run dev'}`)
  spinner.stop()
  // show success message
  success(filePath);
  };
  
  run();