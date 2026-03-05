describe('Setup', () => {

    before(() => {
        cy.dropCollection('orphanages')
    })

    it('Drop successfully', () => {
        cy.log('Drop successfully')
    })
})