import { autofocus } from 'src/directives/directive-autofocus'

export default ({ app }) => {
  app.directive('autofocus', autofocus)
}
