// Module imports
import moment from 'moment'





// Component imports
import { actions } from '../../store'
import { Link } from '../../routes'
import Component from '../../components/Component'
import Page from '../../components/Page'
import userHasPermission from '../../helpers/userHasPermission'




// Component imports
const title = 'Paperwork'





class Paperwork extends Component {
  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  async componentDidMount () {
    const { id, rescue } = this.props

    if (id && !rescue) {
      await this.props.getRescue(id)
    }

    if (this.state.loading) {
      this.setState({ loading: false })
    }
  }

  constructor (props) {
    super(props)

    this._bindMethods([
      'renderRat',
    ])

    this.state = {
      loading: !this.props.rescue,
    }
  }

  static renderQuote (quote, index) {
    return (
      <li key={index}>
        {quote.message}
        {!!quote.author && (
          <span>
            - <em>${quote.author}</em>
          </span>
        )}
      </li>
    )
  }

  static async getInitialProps ({ query, store }) {
    await actions.getRescue(query.id)(store.dispatch)
  }

  renderQuotes () {
    const { rescue } = this.props

    if (rescue.attributes.quotes) {
      return (
        <ol>
          {rescue.attributes.quotes.map(Paperwork.renderQuote)}
        </ol>
      )
    }

    return (
      <span>N/A</span>
    )
  }

  renderRat (rat, index) {
    const { rescue } = this.props

    return (
      <li key={index}>
        {rat.attributes.name}
        {(rat.id === rescue.attributes.firstLimpetId) && (
          <span className="badge">First Limpet</span>
        )}
      </li>
    )
  }

  renderRats () {
    const { rats } = this.props

    return (
      <ul>
        {rats.map(this.renderRat)}
      </ul>
    )
  }

  render () {
    const {
      rescue,
    } = this.props

    const {
      loading,
    } = this.state

    const userCanEdit = this.userCanEdit()

    return (
      <div className="page-wrapper">
        <header className="page-header">
          <h1>{title}</h1>
        </header>

        {loading && (
          <div className="loading page-content" />
        )}

        {(!loading && !rescue) && (
          <div className="loading page-content">
            <p>Sorry, we couldn't find the paperwork you requested.</p>
          </div>
        )}

        {(!loading && rescue) && (
          <div className="page-content">
            <menu type="toolbar">
              <div className="primary">
                {userCanEdit && (
                  <Link route="paperwork edit" params={{ id: rescue.id }} >
                    <a className="button">
                        Edit
                    </a>
                  </Link>
                )}
              </div>

              <div className="secondary" />
            </menu>
            <table>
              <tbody>
                <tr>
                  <th>Created</th>
                  <td>{moment(rescue.attributes.createdAt).format('DD MMM, YYYY HH:mm')}</td>
                </tr>

                <tr>
                  <th>Updated</th>
                  <td>{moment(rescue.attributes.updatedAt).format('DD MMM, YYYY HH:mm')}</td>
                </tr>

                <tr>
                  <th>Platform</th>
                  <td>{rescue.attributes.platform}</td>
                </tr>

                <tr>
                  <th>Status</th>
                  <td>{rescue.attributes.status}</td>
                </tr>

                <tr>
                  <th>Outcome</th>
                  <td>{rescue.attributes.outcome}</td>
                </tr>

                <tr>
                  <th>Code Red</th>
                  <td>{rescue.attributes.codeRed ? 'Yes' : 'No'}</td>
                </tr>

                <tr>
                  <th>Rats</th>
                  <td>{this.renderRats()}</td>
                </tr>

                <tr>
                  <th>System</th>
                  <td>{rescue.attributes.system}</td>
                </tr>

                <tr>
                  <th>Quotes</th>
                  <td>{this.renderQuotes()}</td>
                </tr>

                <tr>
                  <th>Notes</th>
                  <td>{rescue.attributes.notes}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    )
  }





  /***************************************************************************\
    Getters
  \***************************************************************************/

  userCanEdit () {
    const {
      rescue,
      currentUser,
      currentUserGroups,
    } = this.props

    if (!rescue || !currentUser.relationships) {
      return false
    }

    // Check if current user is assigned to case.
    const assignedRatIds = rescue.relationships.rats.data.map(rat => rat.id)
    const currentUserRatIds = currentUser.relationships.rats.data.map(rat => rat.id)

    if (assignedRatIds.some(ratId => currentUserRatIds.includes(ratId))) {
      return true
    }

    // Check if the paperwork is not yet time locked
    if ((new Date()).getTime() - (new Date(rescue.attributes.createdAt)).getTime() <= 3600000) {
      return true
    }

    // Check if user has the permission to edit the paperwork anyway
    if (currentUserGroups.length && userHasPermission(currentUserGroups, 'rescue.write')) {
      return true
    }

    return false
  }
}





const mapDispatchToProps = ['getRescue']

const mapStateToProps = (state, ownProps) => {
  const { id: rescueId } = ownProps.query
  let firstLimpet = []
  let rats = []
  let rescue = null

  if (rescueId) {
    rescue = state.rescues[rescueId]
  }

  if (rescue) {
    if (rescue.relationships.firstLimpet.data) {
      firstLimpet = state.rats.rats.filter(rat => rescue.relationships.firstLimpet.data.id === rat.id)
    }

    rats = state.rats.rats
      .filter(rat => rescue.relationships.rats.data.find(({ id }) => rat.id === id))
      .map(rat => Object.assign({
        id: rat.id,
        value: rat.attributes.name,
      }, rat))
  }

  const currentUser = state.user
  const currentUserGroups = currentUser.relationships ? [...currentUser.relationships.groups.data].map(group => state.groups[group.id]) : []


  return {
    firstLimpet,
    rats,
    rescue,
    currentUser,
    currentUserGroups,
  }
}





export default Page(title, true, mapStateToProps, mapDispatchToProps)(Paperwork)
