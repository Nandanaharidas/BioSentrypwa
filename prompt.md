# BioSentry 

I am creating an application called BioSentry, which is used to read user medical records such as 
- temperature
- pressure
- skin conductance
- skin rash using camera 
using a esp32 device

can you create a sveltekit based frontend and a firebase based backend project 
Refer the flow diagram/wireframe Flow.jpeg to create the project  
also create a simple dashboard for pharmacovigilance

which shows filterable  data across different drugs 

Projects users sveltekit5


use docs/Flow.jpeg for reference

# tech stack


## Frontend
- mobile app 
    - sveltekit(5) pwa app 

 - sveltekit web based interface for drug research

## IOT
- esp32 device
 
## Backend
- firebase
- pgvector

## AI

- takes data given by the app, 
and processes it and classify it and return the data to user 
(yet to think about)

---

# IOT device

can you create a simple nodejs http server that simulate a http server from that iot device with serves these data? as a seprate project



# Sveltekit user client

## authentication

- signup - firebase - username, phone number, password , login with google

- login - firebase - username, phone number, password , login with google

> create proper layout and services for handling authentication state


- show about page

- user questionnaire - after login, have a user questionnaire
make it as multiple pages so user don't get overwhelmed
    - gender 
    - age/dob
    - other contact info
    - location 
    - weight
    - height
    - Blood group

    - Chronic conditions (searchable drop down and  user can add additional - tag based system)
    - vaccinations
    - Past medications

    - drug use - smoking Alcohol use

    store these as sperate documents in firebase, other than default user authentication document used for authentication

    

- Main dashboard

    - title and about 

    - measure drug metrics 
        - this will help user to add/ measure details for a drug to check if there is any ADR and report

    - See past ADR test results 
        - shows list of past drugs, and details for each drugs

    - contact emergency services 


---

## measure drug metrics flow

- after clicking on measure drug metrics on user dashboard - redirected to drug list page

### drug list page

- user can add a new drug or choose an existing drug  

- this will redirect to data measurement page

### data measurement page

 - this page shows connect to device button
 (device is esp32 based IoT device that measure - temp, pressure,o2 level, skin conductance and transmit over http )

 - camera that can detect and check swelling, rapid eye movements, shivering - record video  

 -  grid of graphs for various metrics that are currently measuring live

 - immediate ADR severity detected based on past data & current (rough estimate)

- additional comments 

- emergency services contact

if the ADR severity is high-> show popup for contacting emergency services services


---

## ADR test results

- shows list of past/completed drug test results

- user clicks on one drug

- show a result saying if it is still processing/ or severity of the drug 

- shows a grid of temp/pressure other metrics over days that which is measured

- a button to create new measurement


## About page

- Refer Informationpage and Info2 images 










