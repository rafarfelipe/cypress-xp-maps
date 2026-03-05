import data from '../fixtures/orphanages.json'

describe('Mapa', () => {
    it('Deve poder escolher um orfanato no mapa', () => {
        const orphanages = data.map

        cy.deleteMany({ name: orphanages.name }, { collection: 'orphanages' })
        cy.postOrphanage(orphanages)

        cy.openOrphanage(orphanages.name)

        cy.contains('h1', orphanages.name)
            .should('be.visible')

        cy.googleMapLink(orphanages.position)
    })
})