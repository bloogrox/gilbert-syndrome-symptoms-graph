const Node = {
    data() {
        return {
            causedBy: [],
            mayCause: [],
            tab: 0,
        }
    },
    template: `
        <v-card
            class="mx-auto"
            max-width="600">

            <v-app-bar
            color=""
            dense
            >

                <v-app-bar-title>{{ $route.params.text }}</v-app-bar-title>

                <v-spacer></v-spacer>

                <!--v-btn icon>
                    <v-icon>mdi-magnify</v-icon>
                </v-btn-->

                <template v-slot:extension>
                    <v-tabs align-with-title v-model="tab">
                        <v-tabs-slider></v-tabs-slider>
                        <v-tab :key="0">Возможные причины</v-tab>
                        <v-tab :key="1">Последствия</v-tab>
                    </v-tabs>
                </template>

            </v-app-bar>

            <v-card max-width="600" class="mx-auto" tile>

                <v-tabs-items v-model="tab">
                    <v-tab-item :key="0">
                        <v-card>
                            <v-list>
                                <!--v-subheader>Возможные причины</v-subheader-->
                                <v-list-item
                                    v-for="(el, i) in causedBy"                                    :key="i"
                                    :to="{name: 'node', params: {text: el}}"
                                >
                                    <v-list-item-content>
                                        <v-list-item-title v-text="el"></v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            <v-list>
                        </v-card>
                    </v-tab-item>

                    <v-tab-item :key="1">
                        <v-card>
                            <v-list>
                                <!--v-subheader>Последствия</v-subheader-->
                                <v-list-item
                                    v-for="(el, i) in mayCause"
                                    :key="i"
                                    :to="{name: 'node', params: {text: el}}"
                                >

                                    <v-list-item-content>
                                        <v-list-item-title v-text="el"></v-list-item-title>
                                    </v-list-item-content>

                                </v-list-item>
                            <v-list>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>

            </v-card>
        </v-card>

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
            all_elements: [],
            tab: 0,
        }
    },
    template: `
        <v-card class="mx-auto"
        max-width="600">
            <v-app-bar
                color=""
                dense
                >

                <v-app-bar-title>Симптомы</v-app-bar-title>

                <v-spacer></v-spacer>

                <!--v-btn icon>
                    <v-icon>mdi-magnify</v-icon>
                </v-btn-->

                <template v-slot:extension>
                    <v-tabs align-with-title v-model="tab">
                        <v-tabs-slider></v-tabs-slider>
                        <v-tab :key="0">Типичные</v-tab>
                        <v-tab :key="1">Все (а-я)</v-tab>
                    </v-tabs>
                </template>

            </v-app-bar>


            <v-card
                class="mx-auto"
                max-width="600"
                tile
            >

                <v-tabs-items v-model="tab">
                    <v-tab-item :key="0">
                        <v-card>
                            <v-list>
                                <!--v-subheader>Типичные симптомы</v-subheader-->
                                <v-list-item
                                    v-for="(doc, i) in typical_symptoms"
                                    :key="i"
                                    :to="{name: 'node', params: {text: doc.text}}"
                                >

                                    <v-list-item-content>
                                        <v-list-item-title v-text="doc.text"></v-list-item-title>
                                    </v-list-item-content>

                                </v-list-item>
                            <v-list>
                        </v-card>
                    </v-tab-item>

                    <v-tab-item :key="1">
                        <v-card>
                            <v-list>
                                <!--v-subheader>Все симптомы (а-я)</v-subheader-->
                                <v-list-item
                                    v-for="(el, i) in all_elements"
                                    :key="i"
                                    :to="{name: 'node', params: {text: el}}"
                                >
                                    <v-list-item-content>
                                        <v-list-item-title v-text="el"></v-list-item-title>
                                    </v-list-item-content>
                                </v-list-item>
                            <v-list>
                        </v-card>
                    </v-tab-item>
                </v-tabs-items>

            </v-card>

        </v-card>
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
        <div>
            <input v-model="q" v-on:input="search" class="search-input" placeholder="начните вводить текст" />
            <!--h3 v-if="found.length">Найдено {{ found.length }}</h3-->
            <div style="margin-top: 15px;">
                <div v-for="el in found">
                    <router-link :to="{name: 'node', params: {text: el}}"><button class="symptom-item">{{ el }}</button></router-link>
                </div>
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

const router = new VueRouter({
    // history: VueRouter.createWebHistory(),
    routes,
    base: "/gilberts-syndrome-symptoms-graph/",
});

const app = new Vue({
    el: "#app",
    router,
    vuetify: new Vuetify(),
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
}).$mount("#app");

// app.use(router);

// app.mount("#app");
