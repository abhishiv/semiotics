import { transform } from '../index'
import { getExampleDocument } from '../../utils/example_document'

describe('Traversers', () => {
  test('should findNode', async () => {
    const doc = getExampleDocument()
    transform(doc)
  })
})
