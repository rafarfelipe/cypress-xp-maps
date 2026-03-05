// import createPage from '../support/pages/create'
// import mapPage from '../support/pages/map'
import data from '../fixtures/orphanages.json'

import { generator } from '../support/factory'

describe('Cadastro de orfanatos', () => {
    it('Deve cadastrar um novo orfanato', () => {
        const orphanage = generator()

        cy.gotoCreate(orphanage.position)
        cy.createOrphanage(orphanage)
        cy.popupHaveText('Orfanato cadastrado com sucesso.')
    })

    it('Não deve cadastrar orfanato quando o nome é duplicado', () => {
        const orphanage = generator()

        cy.postOrphanage(orphanage)

        cy.gotoCreate(orphanage.position)
        cy.createOrphanage(orphanage)
        cy.popupHaveText('Já existe um cadastro com o nome: ' + orphanage.name)
    })

    context('Campos obrigatórios', () => {
        it('Não deve cadastrar se o nome não for preenchido', () => {

            let orphanage = generator()

            delete orphanage.name

            cy.log(JSON.stringify(orphanage))

            cy.gotoCreate(orphanage.position)
            cy.createOrphanage(orphanage)
            cy.alertHaveText('Nome', 'Campo obrigatório')
        })

        it('Não deve cadastrar se o sobre não for preenchido', () => {

            let orphanage = generator()

            delete orphanage.description

            cy.log(JSON.stringify(orphanage))

            cy.gotoCreate(orphanage.position)
            cy.createOrphanage(orphanage)
            cy.alertHaveText('Sobre', 'Campo obrigatório')
        })

        it('Não deve cadastrar não anexar a imagem', () => {

            let orphanage = generator()

            delete orphanage.image

            cy.log(JSON.stringify(orphanage))

            cy.gotoCreate(orphanage.position)
            cy.createOrphanage(orphanage)
            cy.alertHaveText('Fotos', 'Envie pelo menos uma foto')

        })

        it('Não deve cadastrar se o horario não for informado', () => {

            let orphanage = generator()

            delete orphanage.opening_hours

            cy.log(JSON.stringify(orphanage))

            cy.gotoCreate(orphanage.position)
            cy.createOrphanage(orphanage)
            cy.alertHaveText('Horário', 'Campo obrigatório')
        })

        it('Não deve cadastrar os campos obrigatórios não forem preenchidos', () => {

            let orphanage = generator()

            delete orphanage.name
            delete orphanage.description
            delete orphanage.opening_hours
            delete orphanage.image

            cy.log(JSON.stringify(orphanage))

            cy.gotoCreate(orphanage.position)
            cy.createOrphanage(orphanage)

            cy.alertHaveText('Nome', 'Campo obrigatório')
            cy.alertHaveText('Sobre', 'Campo obrigatório')
            cy.alertHaveText('Fotos', 'Envie pelo menos uma foto')
            cy.alertHaveText('Horário', 'Campo obrigatório')
        })
    })
})