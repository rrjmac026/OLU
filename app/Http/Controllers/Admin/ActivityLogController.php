<?php

namespace App\Http\Controllers\Admin;

use App\Enums\ActivityAction;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ActivityLogFilterRequest;
use App\Models\ActivityLog;
use App\Models\User;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    public function index(ActivityLogFilterRequest $request): Response
    {
        $filters = $request->validated();

        $logs = ActivityLog::with('user:id,name')
            ->filter($filters)
            ->latest('id')
            ->paginate(25)
            ->withQueryString()
            ->through(fn (ActivityLog $l) => [
                'id' => $l->id,
                'user' => $l->user?->name,
                'action' => $l->action->value,
                'action_label' => $l->action->label(),
                'description' => $l->description,
                'subject_type' => $l->subject_type,
                'properties' => $l->properties,
                'ip_address' => $l->ip_address,
                'user_agent' => $l->user_agent,
                'created_at' => $l->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/activity-logs', [
            'logs' => $logs,
            'filters' => (object) $filters,
            'actions' => collect(ActivityAction::cases())
                ->map(fn ($a) => ['value' => $a->value, 'label' => $a->label()])
                ->values(),
            'users' => User::orderBy('name')->get(['id', 'name']),
        ]);
    }
}