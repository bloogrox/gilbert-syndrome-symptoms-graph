const Node = {
    data() {
        return {
            causedBy: [],
            mayCause: []
        }
    },
    template: `
        <router-link to="/">Главная</router-link>
        <h2>{{ $route.params.text }}</h2>
        <h3 v-if="causedBy.length">возможные причины</h3>
        <div v-for="el in causedBy">
            <router-link :to="{name: 'node', params: {text: el}}"><button class="symptom-item">{{ el }}</button></router-link>
        </div>
        <h3 v-if="mayCause.length">"{{ $route.params.text }}" может приводить к</h3>
        <div v-for="el in mayCause">
            <router-link :to="{name: 'node', params: {text: el}}"><button class="symptom-item">{{ el }}</button></router-link>
        </div>
    `,
    created() {
        this.fetchData();

        this.$watch(
            () => this.$route.params,
            (toParams, previousParams) => {
                this.fetchData();
            }
        )
    },
    methods: {
        fetchData() {
            const first = seq => seq[0];

            const query_causes = `
                [
                    :find ?t
                    :in $ ?inp
                    :where
                    [?e "text" ?inp]
                    [?e "caused-by" ?x]
                    [?x "text" ?t]
                ]
            `;
            this.causedBy = (
                datascript.q(query_causes, db, this.$route.params.text)
                .map(first)
            )


            const query_effects = `
                [
                    :find ?t
                    :in $ ?inp
                    :where
                    [?e "text" ?inp]
                    [?x "caused-by" ?e]
                    [?x "text" ?t]
                ]
            `;
            this.mayCause = (
                datascript.q(query_effects, db, this.$route.params.text)
                .map(first)
            )
        }
    }
}

const Index = {
    data() {
        return {
            typical_symptoms: [],
            all_elements: []
        }
    },
    template: `
        <router-link :to="{name: 'search'}">Найти</router-link>
        <h3>Типичные симптомы</h3>
        <div v-for="doc in typical_symptoms">
            <router-link :to="{name: 'node', params: {text: doc.text}}"><button class="symptom-item">{{ doc.text }}</button></router-link>
        </div>
        <h3>Все симптомы (а-я)</h3>
        <div v-for="el in all_elements">
            <router-link :to="{name: 'node', params: {text: el}}"><button class="symptom-item">{{ el }}</button></router-link>
        </div>
    `,
    created() {
        const query = `
            [
                :find ?t
                :where
                [?e "text" ?t]
            ]
        `;
        const compare_insensitive = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());
        const first = seq => seq[0];
        this.all_elements = (
            datascript.q(query, db)
            .map(first)
            .sort(compare_insensitive)
        );

        const ids = [23, 19, 11, 14, 35, 15, 1, 32];
        this.typical_symptoms = datascript.pull_many(db, '["*"]', ids);
    }
}

const Search = {
    data() {
        return {
            q: "",
            found: [],
        }
    },
    template: `
        <input v-model="q" v-on:input="search" class="search-input" placeholder="начните вводить текст" />
        <!--h3 v-if="found.length">Найдено {{ found.length }}</h3-->
        <div style="margin-top: 15px;">
            <div v-for="el in found">
                <router-link :to="{name: 'node', params: {text: el}}"><button class="symptom-item">{{ el }}</button></router-link>
            </div>
        </div>
    `,
    methods: {
        search() {
            const prop = field => dict => dict[field];
            let ids = searchIndex.search(this.q);
            this.found = datascript.pull_many(db, '["text"]', ids).map(prop('text'));

            // console.log(res);
            // this.found = [
            //     "запор",
            //     "метеоризм",
            // ]
        },
    }
}
const routes = [
    { name: 'node', path: '/nodes/:text', component: Node },
    { name: 'home', path: '/', component: Index },
    { name: 'search', path: '/search', component: Search },
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes,
    base: "/gilberts-syndrome-symptoms-graph/",
});

const app = Vue.createApp({
    data() {
        return {
        //     elements: []
        }
    },
    methods: {
        func(arg, event) {
        },
    },
    mounted () {
        // const query = `
        //     [:find ?t
        //      :in $ ?inp
        //      :where
        //      [?e "text" ?inp]
        //      [?e "caused-by" ?x]
        //      [?x "text" ?t]
        //     ]`;
        // this.elements = datascript.q(query, db, "метеоризм").map(arr => arr[0]);
    }
});

app.use(router);

app.mount("#app");
