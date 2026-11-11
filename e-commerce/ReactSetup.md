# Setup React Project

- install node js new LTS version from (https://nodejs.org/dist/v22.13.0/node-v22.13.0-x64.msi)
- do not tick the checkbox (or do not install chocolaty)
- restart vs code after installing node
- check node version using ``node -v``
- check npm version using ``npm -v``
- npm -> node package manager

## create react project with create-react-app(cra)

- install create-react-app globally using ``npm i -g create-react-app``
- i means install
- -g means globally
- check create-react-app version :``create-react-app -V``
- if there is asn error like running script disabled then type this command in terminal ``Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned``
- to create a new React Project :  ``create-react-app helloreact``
- change folder to helloreact :  ``cd helloreact``
- open project folder in VS code :``code .``
- Start the project :``npm start``
- now check browser or type ``http://localhost:3000`` in urlbar in chrome
