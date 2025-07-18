# @raphanogueira/plugin-analytics-internal-frontend

This plugin is responsible for managing the metrics screens.

## Installation

This plugin is installed via the `@raphanogueira/plugin-analytics-internal-frontend` package. To install the Backstage frontend package, run the following command sequence:

```bash
# From your root directory
yarn --cwd packages/app add @raphanogueira/plugin-analytics-internal-frontend
```

## Configuration

After installation, we need to configure the plugin.

We need to add the code snippet below inside our `package/app/src/components/Root/Root.tsx`:

```tsx
import MetricIcon from '@material-ui/icons/BarChart'

//...

<SidebarItem icon={MetricIcon} to="analytics-internal" text="Metrics" />
```

Where `to` must be `analytics-internal` and `text` will be the text in the sidebar.

After the implementations in `Root.tsx`, we need to add the dependencies for our screens in `package/app/src/App.tsx`:

```tsx
import { ActivityInsightDetailsPage, AnalyticsInternalPage} from '@raphanogueira/plugin-analytics-internal-frontend'

//...

<Route path="/analytics-internal" element={<AnalyticsInternalPage formatDateToShort={false} />} />
<Route path="/analytics-internal/:id" element={<ActivityInsightDetailsPage formatDateToShort={false} />} />
```

Here we follow the same principle: the `path` values must be these.

The `formatDateToShort` field is optional. By default, its value is `true` to display the date already formatted without hours, minutes, and seconds. If you need this information, just pass the value `false` as in the example above. Otherwise, it can be used like this:

```tsx
import { ActivityInsightDetailsPage, AnalyticsInternalPage} from '@raphanogueira/plugin-analytics-internal-frontend'

//...

<Route path="/analytics-internal" element={<AnalyticsInternalPage />} />
<Route path="/analytics-internal/:id" element={<ActivityInsightDetailsPage />} />
```

After these configurations, your screen will be available for use.

## Development

1. To run it locally, simply execute yarn install in the project's root directory.

2. After installing the dependencies, just run yarn start, and it will execute the project with all the plugins present in the repository.

3. Access the [Metrics](http://localhost:3000/analytics-internal) menu to view the data.