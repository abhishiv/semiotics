import { transformJSX } from '../index'
import { getExampleDocument } from '../../utils/example_document'
import { translateNode, transpileTSNode, defaultConfig } from '../../transpilers/index'

describe('Traversers', () => {
  test('should transformJSX', async () => {
    const doc = getExampleDocument()
    transformJSX(doc)
    const tsNode = translateNode(defaultConfig, doc, [])
    const text = transpileTSNode(tsNode)
    console.log(text)
  })
})
