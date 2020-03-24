'use strict';

const e = React.createElement;

const Spinner = () => (
    <div id="loading_spinner" className="spinner" />
);

// simplified "day of the year": there's gaps, but it sorts correctly
const dateToDayOrd = (date) => date.getMonth() * 31 + date.getDate();

const annotateSortDirection = (choices, chosen, reverse) => {
    return choices.map(
        (tuple) => {
            const [code, pretty] = tuple;
            if (code === chosen) {
                if (reverse) {
                    return [code, `${pretty} v`];
                } else {
                    return [code, `${pretty} ^`];
                }
            } else {
                return tuple;
            }
        }
    )
}
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

const MultipleChoice = (props) => (
    <span className="choices" style={{gridTemplateColumns:`repeat(${props.choices.length}, auto)`}}>
        {props.choices.map(([value, pretty]) => (
            <button
                onClick={() => props.onClick(value)}
                key={value}
                className={props.chosen === value ? "button button-selected" : "button"}
            >{pretty}</button>
        ))}
    </span>
);

const Field = (props) => <div className="field">{props.caption}: {props.child}</div>
const Person = (props) => {
    return (
        <div className="littleGaps">
            <img src={props.picture.medium} width="72" height="72" />
            <Field caption="Name" child={`${props.name.first} ${props.name.last}`} />
            <Field caption="Gender" child={props.gender} />
            <Field caption="Country" child={props.location.country} />
            <Field caption="Date of birth" child={<LocaleDate date={props.dob.date} />} />
            <Field caption="Birthday" child={<Birthday date={props.dob.date} />} />
        </div>
    );
};
const People = (props) => {
    const people = props.people.slice();
    let sorter;
    if (props.sort === 'name') {
        sorter = (a, b) => `${a.name.first} ${a.name.last}`.localeCompare(`${b.name.first} ${b.name.last}`);
    } else if (props.sort === 'dob') {
        sorter = (a, b) => new Date(a.dob.date).getTime() - new Date(b.dob.date).getTime();
    } else if (props.sort === 'birthday') {
        sorter = (a, b) => dateToDayOrd(new Date(a.dob.date)) - dateToDayOrd(new Date(b.dob.date));
    }
    if (props.reverse) {
        people.sort((a, b) => sorter(b, a));
    } else {
        people.sort(sorter);
    }
    return (
        <div className={`bigGaps layout-${props.layout}`}>
            {(()=>{
                if (props.layout === 'table') {
                    return people.map((person) => [
                        <img src={person.picture.thumbnail} width="24" height="24" />,
                        <span>{person.name.first} {person.name.last}</span>,
                        <span>{person.gender}</span>,
                        <span>{person.location.country}</span>,
                        <span><LocaleDate date={person.dob.date} /></span>,
                        <span><Birthday date={person.dob.date} /></span>
                    ]).reduce((a, b) => a.concat(b), [
                        <span/>,
                        <strong>Name</strong>,
                        <strong>Gender</strong>,
                        <strong>Country</strong>,
                        <strong><abbr title="Date of Birth">DOB</abbr></strong>,
                        <strong>Birthday</strong>
                    ]);
                } else {
                    return people.map((person) => <Person {...person} key={person.id} />);
                }
            })()}
        </div>
    );
}
class Main extends React.Component {
    constructor (props) {
        super(props);
        this.state = { state: 'loading', sort: 'name', reverse: 0, layout: 'tiles' };
    }
    handleSortClick = (sort) => {
        this.setState((old) => {
            if (old.sort === sort) {
                return {reverse: 1 - old.reverse};
            } else {
                return {sort, reverse: 0};
            }
        });
    }
    render () {
        if (this.state.state === 'loading') {
            return <Spinner />
        } else if (this.state.state === 'error') {
            return `Error: ${this.state.error}`;
        } else if (this.state.state === 'loaded') {
            return (
                <div className="bigGaps">
                    <div className="littleGaps">
                        <h1>Controls</h1>
                        <Field caption="Sort" child={
                            <MultipleChoice
                                choices={annotateSortDirection([['name', 'Name'], ['dob', 'Age'], ['birthday', 'Birthday']], this.state.sort, this.state.reverse)}
                                chosen={this.state.sort}
                                onClick={this.handleSortClick}
                            />
                        } />
                        <Field caption="Layout" child={
                            <MultipleChoice
                                choices={[['table', 'Table'], ['tiles', 'Tiles']]}
                                chosen={this.state.layout}
                                onClick={(layout) => this.setState({layout})}
                            />
                        } />
                    </div>

                    <h1>Users</h1>

                    <div className="bigGaps">
                        <People people={this.state.people} sort={this.state.sort} reverse={this.state.reverse} layout={this.state.layout} />
                    </div>
                </div>
            );
        }
    }
    componentDidMount () {
        fetch('https://randomuser.me/api/?results=20&nat=us,ca&inc=gender,name,location,dob,picture'
        ).then(
            (res) => res.json()
        ).then((body) => {
            if (body.error) {
                throw new Error(error)
            }
            return body;
        }).then((body) => {
            body.results.forEach((person, i) => person.id = i);
            return body;
        }).then((body) => this.setState({state: 'loaded', people: body.results}),
            (error) => this.setState({state: 'error', error: error})
        )
    }
}
const Outer = () => (
    <div className="bigGaps">
        <div className="littleGaps">
            <h1>React Demo</h1>

            <p>This is a quick demo to brush up on my <a href="https://reactjs.org/">React</a></p>

            <p>Below are some random users from <a href="https://randomuser.me/">randomuser.me</a></p>
        </div>

        <Main />
    </div>
);

const loadingSpinner = document.querySelector('#loadingSpinner');
loadingSpinner.parentNode.removeChild(loadingSpinner);
const domContainer = document.querySelector('#reactOuter');
ReactDOM.render(e(Outer), domContainer);
