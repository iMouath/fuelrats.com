// Component imports
import { actions } from '../../store'
import { Router } from '../../routes'
import Component from '../../components/Component'
import FirstLimpetInput from '../../components/FirstLimpetInput'
import RadioOptionsInput from '../../components/RadioOptionsInput'
import RatTagsInput from '../../components/RatTagsInput'
import Page from '../../components/Page'
import SystemTagsInput from '../../components/SystemTagsInput'
import userHasPermission from '../../helpers/userHasPermission'





// Component constants
const title = 'Paperwork'





class Paperwork extends Component {
  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  _handleChange = ({ target }) => {
    const {
      name,
      value,
    } = target

    this._setChanges({
      [name]: value,
    })
  }

  _handleNotesChange = event => this._setChanges({ notes: event.target.value })

  _handleRadioOptionsChange = (option) => {
    const attribute = option.name
    let { value } = option

    if (value === 'true') {
      value = true
    } else if (value === 'false') {
      value = false
    }

    const changes = {}

    if (attribute === 'platform' && value !== this.props.rescue) {
      changes.firstLimpetId = null
      changes.ratsAdded = {}
      changes.ratsRemoved = { ...this.props.rats }
    }

    this._setChanges({
      ...changes,
      [attribute]: value,
    })
  }

  _handleFirstLimpetChange = value => {
    // Because tagsInput sometimes decides to randomly call onChange when it hasn't changed.
    if (typeof this.state.changes.firstLimpetId === 'undefined' && value.length && value[0].id === this.props.rescue.attributes.firstLimpetId) {
      return
    }

    let newValue = null

    if (value.length) {
      if (value[0].id === this.props.rescue.attributes.firstLimpetId) {
        newValue = undefined
      } else {
        newValue = value
      }
    }

    this._setChanges({ firstLimpetId: newValue })
  }

  _handleSystemChange = value => {
    // Because tagsInput sometimes decides to randomly call onChange when it hasn't changed.
    if (typeof this.state.changes.system === 'undefined' && value.length && value[0].value === this.props.rescue.attributes.system) {
      return
    }

    let newValue = null

    if (value.length) {
      if (value[0].value === this.props.rescue.attributes.system) {
        newValue = undefined
      } else {
        newValue = value
      }
    }

    this._setChanges({ system: newValue })
  }

  _handleRatsAdd = value => {
    const {
      ratsAdded,
      ratsRemoved,
    } = this.state.changes

    // See if the rat was previously removed so we don't add them twice.
    const ratWasRemoved = ratsRemoved && ratsRemoved[value.id]

    if (ratWasRemoved) {
      const newRatsRemoved = { ...ratsRemoved }
      delete newRatsRemoved[value.id]
      this._setChanges({ ratsRemoved: newRatsRemoved })
    } else {
      this._setChanges({
        ratsAdded: {
          ...(ratsAdded || {}),
          [value.id]: value,
        },
      })
    }
  }

  _handleRatsRemove = value => {
    const {
      ratsAdded,
      ratsRemoved,
      firstLimpetId,
    } = this.state.changes
    const newChanges = {}

    // Remove the rat from ratsAdded if they are new additions to the assigned list.
    const ratWasAdded = ratsAdded && ratsAdded[value.id]

    if (ratWasAdded) {
      const newRatsAdded = { ...ratsAdded }
      delete newRatsAdded[value.id]
      newChanges.ratsAdded = newRatsAdded
    } else {
      newChanges.ratsRemoved = {
        ...(ratsRemoved || {}),
        [value.id]: value,
      }
    }

    if (value.id === firstLimpetId || value.id === this.props.rescue.attributes.firstLimpetId) {
      newChanges.firstLimpetId = null
    }

    this._setChanges(newChanges)
  }

  _onSubmit = async (event) => {
    event.preventDefault()

    const { rescue } = this.props
    const { changes } = this.state

    if (!rescue.attributes.outcome || !changes.outcome) {
      return
    }

    const {
      ratsAdded,
      ratsRemoved,
      ...attributeChanges
    } = changes
    let {
      system,
      firstLimpetId,
    } = changes

    let ratUpdates = null

    if ((ratsAdded && Object.values(ratsAdded).length) || (ratsRemoved && Object.values(ratsRemoved).length)) {
      ratUpdates = {
        added: ratsAdded ? Object.values(ratsAdded).map(rat => rat.id) : [],
        removed: ratsRemoved ? Object.values(ratsRemoved).map(rat => rat.id) : [],
      }
    }

    if (firstLimpetId && firstLimpetId.length && firstLimpetId[0].id !== rescue.attributes.firstLimpetId) {
      firstLimpetId = firstLimpetId[0].id
    }

    if (system && system.length && system[0].value !== rescue.attributes.system) {
      system = system[0].value.toUpperCase()
    }

    const { status } = await this.props.updateRescue(rescue.id, {
      ...attributeChanges,
      firstLimpetId,
      system,
    }, ratUpdates)

    console.log('HEYO')

    if (status === 'error') {
      this.setState({ error: true })
      return
    }

    Router.pushRoute('paperwork view', { id: rescue.id })
  }

  _setChanges = changedFields => {
    const {
      rescue,
    } = this.props
    const changes = { ...this.state.changes }

    Object.entries(changedFields).forEach(([key, value]) => {
      changes[key] = value === rescue.attributes[key] ? undefined : value
    })

    this.setState({
      changes,
    })
  }

  /***************************************************************************\
    Public Methods
  \***************************************************************************/
  constructor (props) {
    super(props)

    this.state = {
      error: null,
      changes: {},
    }
  }

  static async getInitialProps({ query, store }) {
    await actions.getRescue(query.id)(store.dispatch)
  }

  render () {
    const {
      rescue,
    } = this.props
    const {
      loading,
      submitting,
      error,
    } = this.state

    const classes = ['page-content']

    if (loading || submitting) {
      classes.push('loading', 'force')
    }

    const fieldValues = this.getFieldValues()

    const {
      codeRed,
      firstLimpetId,
      notes,
      outcome,
      platform,
      rats,
      system,
    } = fieldValues

    const ratNameTemplate = rat => `${rat.attributes.name} [${rat.attributes.platform.toUpperCase()}]`

    const pwValidity = this.validate(fieldValues)

    return (
      <div className="page-wrapper">
        <header className="page-header">
          <h1>{title}</h1>
        </header>

        {(error && !submitting) && (
          <div className="store-errors">
            <div className="store-error">
              Error while submitting paperwork.
            </div>
          </div>
        )}

        {loading && (
          <div className="loading page-content" />
        )}

        {(!loading && !rescue) && (
          <div className="loading page-content">
            <p>Sorry, we couldn't find the paperwork you requested.</p>
          </div>
        )}

        {(!loading && rescue) && (
          <form
            className={classes.join(' ')}
            onSubmit={this._onSubmit}>
            <fieldset>
              <label htmlFor="platform">What platform was the rescue on?</label>

              <RadioOptionsInput
                disabled={submitting || loading}
                className="platform"
                name="platform"
                id="platform"
                value={platform}
                onChange={this._handleRadioOptionsChange}
                options={[
                  {
                    value: 'pc',
                    displayValue: 'PC',
                  },
                  {
                    value: 'xb',
                    displayValue: 'Xbox',
                  },
                  {
                    value: 'ps',
                    displayValue: 'PS4',
                  },
                ]} />
            </fieldset>

            <fieldset>
              <label htmlFor="outcome-success">Was the rescue successful?</label>

              <RadioOptionsInput
                disabled={submitting || loading}
                className="outcome"
                name="outcome"
                id="outcome"
                value={outcome}
                onChange={this._handleRadioOptionsChange}
                options={[
                  {
                    value: 'success',
                    displayValue: 'Yes',
                  },
                  {
                    value: 'failure',
                    displayValue: 'No',
                  },
                  {
                    value: 'invalid',
                    displayValue: 'Invalid',
                  },
                  {
                    value: 'other',
                    displayValue: 'Other',
                  },
                ]} />
            </fieldset>

            <fieldset>
              <label htmlFor="codeRed-yes">Was it a code red?</label>
              <RadioOptionsInput
                disabled={submitting || loading}
                className="codeRed"
                name="codeRed"
                id="codeRed"
                value={`${codeRed}`}
                onChange={this._handleRadioOptionsChange}
                options={[
                  {
                    value: 'true',
                    displayValue: 'Yes',
                  },
                  {
                    value: 'false',
                    displayValue: 'No',
                  },
                ]} />
            </fieldset>

            <fieldset>
              <label htmlFor="rats">Who was assigned to this rescue?</label>

              <RatTagsInput
                data-platform={platform}
                disabled={submitting || loading}
                name="rats"
                onAdd={this._handleRatsAdd}
                onRemove={this._handleRatsRemove}
                value={rats}
                valueProp={ratNameTemplate} />
            </fieldset>

            <fieldset>
              <label htmlFor="firstLimpetId">Who fired the first limpet?</label>

              <FirstLimpetInput
                data-single
                disabled={submitting || loading}
                name="firstLimpetId"
                onChange={this._handleFirstLimpetChange}
                options={rats}
                value={firstLimpetId}
                valueProp={ratNameTemplate} />
            </fieldset>

            <fieldset>
              <label htmlFor="system">Where did it happen? <small>In what star system did the rescue took place? (put "n/a" if not applicable)</small></label>

              <SystemTagsInput
                data-allownew
                disabled={submitting || loading}
                name="system"
                onChange={this._handleSystemChange}
                data-single
                value={system} />
            </fieldset>

            <fieldset>
              <label htmlFor="notes">Notes</label>

              <textarea
                disabled={submitting || loading}
                id="notes"
                name="notes"
                onChange={this._handleNotesChange}
                value={notes} />
            </fieldset>

            <menu type="toolbar">
              <div className="primary">
                <div className={`invalidity-explainer ${pwValidity.noChange ? 'no-change' : ''} ${!pwValidity.valid ? 'show' : ''}`}>{pwValidity.reason}</div>
                <button
                  disabled={submitting || loading || !pwValidity.valid}
                  type="submit">
                  {submitting ? 'Submitting...' : 'Submit'}
                </button>
              </div>

              <div className="secondary" />
            </menu>
          </form>
        )}
      </div>
    )
  }

  lastInvalidReason = null
  validate (values) {
    const { rescue } = this.props
    const { changes } = this.state

    let invalidReason = null
    let noChange = false

    if (!rescue) {
      return {
        valid: false,
        reason: 'Rescue Not Found',
      }
    }

    switch (values.outcome) {
      case 'other':
      case 'invalid':
        invalidReason = this.validateCaseWithInvalidOutcome(values)
        break

      case 'success':
      case 'failure':
        invalidReason = this.validateCaseWithValidOutcome(values)
        break

      default:
        invalidReason = 'Outcome is not set!'
        break
    }

    if (!this.userCanEdit) {
      invalidReason = 'You cannot edit this rescue.'
    }

    if (invalidReason === null && !Object.keys(changes).length) {
      invalidReason = 'No changes have been made yet!'
      noChange = true
    }

    const response = {
      valid: Boolean(invalidReason === null),
      reason: invalidReason || this.lastInvalidReason,
      noChange,
    }

    this.lastInvalidReason = invalidReason

    return response
  }

  validateCaseWithValidOutcome = (values) => {
    if (!values.rats || !values.rats.length) {
      return 'Valid cases must have at least one rat assigned.'
    }

    if (!values.system) {
      return 'Valid cases must have a star system location.'
    }

    if (!values.platform) {
      return 'Valid cases must have a platform.'
    }

    if (values.outcome === 'success' && !values.firstLimpetId) {
      return 'Successful rescues must have a first limpet rat.'
    }

    return null
  }

  validateCaseWithInvalidOutcome = (values) => {
    if (!values.notes.replace(/\s/g, '')) {
      return 'Invalid cases must have notes explaining why the rescue is invalid.'
    }

    return null
  }

  getFieldValues () {
    const { rescue, rats: assignedRats } = this.props
    const { changes } = this.state

    const isDefined = (value, fallback) => (typeof value !== 'undefined' ? value : fallback)
    const getValue = (value) => isDefined(changes[value], rescue.attributes[value])


    const rats = {
      ...assignedRats,
      ...(changes.ratsAdded || {}),
    }

    if (changes.ratsRemoved) {
      for (const removedRat of Object.keys(changes.ratsRemoved)) {
        delete rats[removedRat]
      }
    }

    return {
      codeRed: getValue('codeRed'),
      firstLimpetId: isDefined(changes.firstLimpetId, rats[rescue.attributes.firstLimpetId]) || null,
      notes: getValue('notes'),
      outcome: getValue('outcome'),
      platform: getValue('platform'),
      rats: Object.values(rats),
      system: isDefined(changes.system, { value: rescue.attributes.system.toUpperCase() }),
    }
  }





  /***************************************************************************\
    Getters
  \***************************************************************************/

  get userCanEdit () {
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





const mapDispatchToProps = ['updateRescue', 'getRescue']

const mapStateToProps = (state, ownProps) => {
  const { id: rescueId } = ownProps.query
  let firstLimpetId = []
  let rats = {}
  let rescue = null

  if (rescueId) {
    rescue = state.rescues[rescueId]
  }

  if (rescue) {
    if (rescue.relationships.firstLimpet.data) {
      firstLimpetId = state.rats.rats.filter(rat => rescue.relationships.firstLimpet.data.id === rat.id)
    }

    rats = state.rats.rats
      .filter(rat => rescue.relationships.rats.data.find(({ id }) => rat.id === id))
      .map(rat => ({
        ...rat,
        value: rat.attributes.name,
      }))
      .reduce((accumulator, rat) => ({
        ...accumulator,
        [rat.id]: rat,
      }), {})
  }

  const currentUser = state.user
  const currentUserGroups = currentUser.relationships ? [...currentUser.relationships.groups.data].map(group => state.groups[group.id]) : []

  return {
    firstLimpetId,
    rats,
    rescue,
    currentUser,
    currentUserGroups,
  }
}





export default Page(title, true, mapStateToProps, mapDispatchToProps)(Paperwork)
