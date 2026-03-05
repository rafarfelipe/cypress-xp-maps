// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import './views/map'
import './views/create'
import './views/components'

Cypress.Commands.add('goto', (url, latitude = -23.9639261, longitude = -46.3381554) => {
    cy.visit(url, {
        onBeforeLoad(win) {
            // garante que existe
            if (!win.navigator.geolocation) {
                Object.defineProperty(win.navigator, 'geolocation', {
                    value: {},
                    configurable: true,
                })
            }

            // stub síncrono (sem cy.* aqui)
            Cypress.sinon
                .stub(win.navigator.geolocation, 'getCurrentPosition')
                .callsFake((cb) => cb({ coords: { latitude, longitude } }))

            Cypress.sinon
                .stub(win.navigator.geolocation, 'watchPosition')
                .callsFake((cb) => {
                    cb({ coords: { latitude, longitude } })
                    return 1
                })
        },
    })
})

Cypress.Commands.add('setMapPosition', (position) => {
    window.localStorage.setItem("hope-qa:latitude", position.latitude);
    window.localStorage.setItem("hope-qa:longitude", position.longitude);
})

Cypress.Commands.add('postOrphanage', (orphanage) => {
    cy.fixture('images/' + orphanage.image, 'binary')
        .then((image) => Cypress.Blob.binaryStringToBlob(image, 'image/png'))
        .then((blob) => {
            const formData = new FormData();
            formData.append('name', orphanage.name);
            formData.append('description', orphanage.description);
            formData.append('latitude', orphanage.position.latitude);
            formData.append('longitude', orphanage.position.longitude);
            formData.append('opening_hours', orphanage.opening_hours);
            formData.append('open_on_weekends', orphanage.open_on_weekends);
            formData.append('images', blob, orphanage.image);

            cy.request({
                url: Cypress.env('baseApi') + '/orphanages',
                method: 'POST',
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                body: formData
            }).then(response => {
                expect(response.status).to.eq(201)
            })
        })
})