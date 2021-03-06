// Module imports
import fetch from 'isomorphic-fetch'

// Component imports
import { Link } from '../routes'
import Component from '../components/Component'
import Page from '../components/Page'
import PasswordField from '../components/PasswordField'
import RadioOptionsInput from '../components/RadioOptionsInput'
import TermsDialog from '../components/TermsDialog'


// Component constants
const title = 'Register'

const getWordpressPageElement = async id => {
  const response = await fetch(`/wp-api/pages/${id}`)
  let page = null

  if (response.ok) {
    page = await response.json()
    page = page.content.rendered.replace(/<ul>/gi, '<ul class="bulleted">').replace(/<ol>/gi, '<ol class="numbered">')
  }

  /* eslint-disable react/no-danger */
  return (
    <div dangerouslySetInnerHTML={{ __html: page }} />
  )
  /* eslint-enable react/no-danger */
}





class Register extends Component {
  /***************************************************************************\
    Public Methods
  \***************************************************************************/

  async componentDidMount () {
    this.setState({
      acceptTerms: sessionStorage.getItem('register.acceptTerms'),
      acceptPrivacy: sessionStorage.getItem('register.acceptTerms'),
      email: sessionStorage.getItem('register.email') || '',
      nickname: sessionStorage.getItem('register.nickname') || '',
      ratName: sessionStorage.getItem('register.ratName') || '',
      ratPlatform: sessionStorage.getItem('register.ratPlatform') || 'pc',
    })
  }

  constructor (props) {
    super(props)

    this._bindMethods([
      'handleChange',
      'handleRadioOptionsChange',
      'onSubmit',
    ])

    this.state = {
      acceptTerms: true,
      acceptPrivacy: true,
      email: '',
      nickname: '',
      password: '',
      ratName: '',
      ratPlatform: 'pc',
      recaptchaResponse: null,
      submitting: false,
    }
  }

  handleChange ({ target }) {
    const {
      name,
      type,
    } = target

    const value = type === 'checkbox' ? target.checked : target.value

    if (name !== 'password') {
      sessionStorage.setItem(`register.${name}`, value)
    }

    this.setState({
      [name]: value,
      ...(name === 'acceptTerms' ? { acceptPrivacy: value } : {}),
    })
  }

  handleRadioOptionsChange ({ name, value }) {
    this.setState({ [name]: value })
  }

  async onSubmit (event) {
    event.preventDefault()

    const {
      email,
      nickname,
      password,
      ratName,
      ratPlatform,
      recaptchaResponse,
    } = this.state

    this.setState({ submitting: true })

    const { status: regStatus } = await this.props.register(email, password, ratName, ratPlatform, nickname, recaptchaResponse)

    if (regStatus === 'success') {
      await this.props.login(email, password, '/profile')
    } else {
      this.setState({ submitting: false })
    }
  }

  render () {
    const {
      acceptTerms,
      acceptPrivacy,
      email,
      nickname,
      ratName,
      ratPlatform,
      submitting,
    } = this.state

    return (
      <div className="page-wrapper">
        <header className="page-header">
          <h1>{title}</h1>
        </header>

        <form
          className={`${submitting ? 'loading force' : ''}`}
          data-loader-text="Submitting"
          onSubmit={this.onSubmit}>

          <fieldset data-name="Email">
            <h5>NOTE: This registration page is to become a rat! Need fuel? Click "Get Help" in the bottom left!</h5><br />

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              name="email"
              disabled={submitting}
              onChange={this.handleChange}
              placeholder="i.e. surly_badger@gmail.com"
              ref={_emailEl => this._emailEl = _emailEl}
              required
              type="email"
              value={email} />
          </fieldset>

          <fieldset data-name="Password">
            <label htmlFor="password">
              Password
            </label>

            <PasswordField
              disabled={submitting}
              id="password"
              maxLength="42"
              minLength="5"
              name="password"
              onChange={this.handleChange}
              pattern="^[^\s]{5,42}$"
              placeholder="Use a strong password to keep your account secure"
              ref={_password => this._password = _password}
              required
              showStrength
              showSuggestions />
          </fieldset>

          <fieldset data-name="IRC Nick">
            <label htmlFor="nickname">
              What's your <strong>base</strong> IRC nickname? <small>Base means your nickname without any suffixes, i.e. Surly_Badger instead of Surly_Badger[PC].</small>
            </label>

            <input
              disabled={submitting}
              id="nickname"
              name="nickname"
              onChange={this.handleChange}
              pattern="^[A-z_\-\[\]\\^{}|`][A-z0-9_\-\[\]\\^{}|`]+$"
              placeholder="Surly_Badger"
              ref={_nicknameEl => this._nicknameEl = _nicknameEl}
              required
              type="text"
              value={nickname} />
          </fieldset>

          <fieldset data-name="CMDR Name">
            <label htmlFor="ratName">
              What's your CMDR name? <small>If you have more than one CMDR, you can add the rest later.</small>
            </label>

            <input
              disabled={submitting}
              id="ratName"
              name="ratName"
              onChange={this.handleChange}
              pattern="^[\x00-\x7F]+$"
              placeholder="Surly Badger"
              ref={_ratNameEl => this._ratNameEl = _ratNameEl}
              required
              type="text"
              value={ratName} />
          </fieldset>

          <fieldset data-name="Platform">
            <label>What platform is your CMDR on?</label>

            <RadioOptionsInput
              disabled={submitting}
              className="ratPlatform"
              name="ratPlatform"
              id="ratPlatform"
              value={ratPlatform}
              onChange={this.handleRadioOptionsChange}
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

          <fieldset data-name="Agreements">
            <span>
              <input
                className="large"
                disabled={submitting}
                id="acceptTerms"
                name="acceptTerms"
                type="checkbox"
                checked={acceptTerms && acceptPrivacy}
                onChange={this.handleChange} />
              <label htmlFor="acceptTerms">
                I agree that I have read and agree to the <Link route="legal terms"><a>Terms of Service</a></Link> and <Link route="legal privacy"><a>Privacy Policy</a></Link>, and that I am 13 years of age or older.
              </label>
            </span>
          </fieldset>

          <menu type="toolbar">
            <div className="primary">
              <button
                disabled={submitting || !this.validate()}
                type="submit">
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>

            <div className="secondary" />
          </menu>
        </form>

        { !acceptTerms && !acceptPrivacy && (
          <TermsDialog
            dialogContent={() => getWordpressPageElement(3545)}
            onClose={() => this.setState({ acceptTerms: true })}
            title="Terms of Service"
            checkboxLabel="I have read and agree to these Terms of Service" />
        )}

        { acceptTerms && !acceptPrivacy && (
          <TermsDialog
            dialogContent={() => getWordpressPageElement(3542)}
            onClose={() => {
              this.setState({ acceptPrivacy: true })
              sessionStorage.setItem('termsAccepted', true)
            }}
            title="Privacy Policy"
            checkboxLabel="I have read and agree to this Privacy Policy" />
        )}

      </div>
    )
  }

  validate () {
    const {
      acceptTerms,
      acceptPrivacy,
      nickname,
      password,
    } = this.state

    if (!this._emailEl || !this._nicknameEl || !this._password || !this._ratNameEl) {
      return false
    }

    if (!this._emailEl.validity.valid || !this._password.validity.valid || !this._nicknameEl.validity.valid || !this._ratNameEl.validity.valid) {
      return false
    }

    if (nickname === password) {
      return false
    }

    if (!acceptTerms || !acceptPrivacy) {
      return false
    }

    return true
  }
}





const mapDispatchToProps = ['register', 'login']





export default Page(title, false, null, mapDispatchToProps)(Register)
