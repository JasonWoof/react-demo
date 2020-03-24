'use strict';

const e = React.createElement;

const Spinner = () => (
    <div id="loading_spinner" className="spinner" />
);

// simplified "day of the year": there's gaps, but it sorts correctly
const dateToDayOrd = (date) => date.getMonth() * 31 + date.getDate();

const LocaleDate = (props) => new Date(props.date).toLocaleDateString();
const Birthday = (props) => {
    const nowOrd = dateToDayOrd(new Date());
    const dateOrd = dateToDayOrd(new Date(props.date));
    if (dateOrd === nowOrd) {
        return "Today!";
    } else if (dateOrd < nowOrd) {
        return "Already happened";
    } else {
        return "Has yet to occur";
    }
}

const Field = (props) => <div className="field">{props.caption}: {props.child}</div>
const Person = (props) => {
    return (
        <div className="person">
            <img src={props.picture.medium} width="72" height="72" />
            <Field caption="Name" child={`${props.name.first} ${props.name.last}`} />
            <Field caption="Gender" child={props.gender} />
            <Field caption="Country" child={props.location.country} />
            <Field caption="Date of birth" child={<LocaleDate date={props.dob.date} />} />
            <Field caption="Birthday" child={<Birthday date={props.dob.date} />} />
        </div>
    );
};
class People extends React.Component {
    constructor (props) {
        super(props);
        this.state = { state: 'loading' };
    }
    render () {
        return (
            <div>
                <h1>Users</h1>

                <div className="people sections">
                    {(() => {
                        if (this.state.state === 'loading') {
                            return <Spinner />
                        } else if (this.state.state === 'error') {
                            return `Error: ${this.state.error}`;
                        } else if (this.state.state === 'loaded') {
                            return this.state.people.map((person, i) => <Person {...person} key={i} />)
                        }
                    })()}
                </div>
            </div>
        );
    }
    componentDidMount () {
        fetch('https://randomuser.me/api/?results=20&nat=us,ca&inc=gender,name,location,dob,picture'
        ).then(
            (res) => res.json()
        ).then(
            (body) => this.setState({state: 'loaded', people: body.results}),
            (error) => this.setState({state: 'error', error: error})
        )
    }
}
const Outer = () => (
    <div className="sections">
        <div>
            <h1>React Demo</h1>

            <p>This is a quick demo to brush up on my <a href="https://reactjs.org/">React</a></p>

            <p>Below are some random users from <a href="https://randomuser.me/">randomuser.me</a></p>
        </div>

        <People />
    </div>
);

const loadingSpinner = document.querySelector('#loadingSpinner');
loadingSpinner.parentNode.removeChild(loadingSpinner);
const domContainer = document.querySelector('#reactOuter');
ReactDOM.render(e(Outer), domContainer);
