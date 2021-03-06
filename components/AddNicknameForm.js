// Module imports
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import React from 'react'





// Component imports
import { actions } from '../store'
import Component from './Component'





class AddNicknameForm extends Component {
  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  constructor (props) {
    super(props)

    this._bindMethods(['onSubmit'])

    this.state = {
      nickname: '',
      submitting: false,
    }
  }

  async onSubmit (event) {
    const { addNickname } = this.props
    const { nickname } = this.state

    event.preventDefault()

    this.setState({ submitting: true })

    /* eslint-disable no-alert */
    await addNickname(nickname, prompt('Please enter your IRC password (this may be different from your website password):'))
    /* eslint-enable */

    this.setState({
      nickname: '',
      submitting: false,
    })
  }

  render () {
    const {
      nickname,
      submitting,
    } = this.state

    return (
      <form
        className="row"
        onSubmit={this.onSubmit}>
        <input
          className="stretch-9"
          name="add-nickname"
          onChange={event => this.setState({ nickname: event.target.value })}
          placeholder="Add a nickname..."
          type="text"
          value={nickname} />
        <button
          disabled={!nickname || submitting}
          type="submit">
          Add
        </button>
      </form>
    )
  }
}





const mapDispatchToProps = dispatch => ({ addNickname: bindActionCreators(actions.addNickname, dispatch) })





export default connect(null, mapDispatchToProps)(AddNicknameForm)
